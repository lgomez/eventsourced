const EventEmitter = require('events');
const nlp = require('nlp_compromise');
const Immutable = require('immutable');
const diff = require('immutablediff');
const patch = require('immutablepatch');
const cqrs = Symbol();
const es = Symbol();
const emitter = Symbol();

const handlers = {
  get(target, key) {
    const entity = target;
    let value = entity[key] || null;
    if (entity[cqrs].commands[key]) {
      value = entity[cqrs].commands[key];
    }
    return value;
  },
  set(target, key, value) {
    const entity = target;
    entity[es].data = entity[es].data.set(key, value);
    entity[key] = entity[es].data.get(key);
    return true;
  },
};

class Entity {
  constructor(events = [], options = {}) {
    this[es] = {};
    this[es].version = 0;
    this[es].history = Array.isArray(events) ? events : [events];
    this[es].data = Immutable.fromJS({});
    this[es].mappings = {};
    this[emitter] = new EventEmitter();
    this[cqrs] = {};
    this[cqrs].commands = {};

    Entity.commands(this).forEach(command => {
      Entity.command(this, command, this[command]);
    });
    Object.assign(this[es].mappings, options.mappings);

    this[es].history.forEach(event => Entity.apply(event, this));

    return new Proxy(this, handlers);
  }
  on(event, listener) {
    this[emitter].on(event, listener);
  }
  emit(event, data) {
    this[emitter].emit(event, data);
  }
  static commands(entity) {
    const prototype = Object.getPrototypeOf(entity);
    const commands = Object.getOwnPropertyNames(prototype);
    commands.shift();
    return commands;
  }
  static command(target, command, fn) {
    const entity = target;
    entity[cqrs].commands[command] = function (...args) {
      const before = this[es].data;
      fn.apply(this, args);
      const after = Immutable.fromJS(this);
      this[es].version += 1;
      const event = Immutable.fromJS({
        name: this[es].mappings[command] || nlp.verb(command).conjugate().past,
        version: this[es].version,
        changeset: diff(before, after),
      });
      Entity.apply(event, this);
      this[es].history.push(event);
      this.emit(event.get('name'), event);
      return null;
    };
  }
  static snapshot(entity) {
    const snapshot = {
      name: 'snapshot',
      version: entity[es].version,
      changeset: diff(Immutable.fromJS({}), entity[es].data),
    };
    return Immutable.fromJS(snapshot);
  }
  static apply(event, target) {
    console.log('APPLYING EVENT', event);
    const entity = target;
    let before = entity[es].data;
    console.log('DATA BEFORE APPLYING EVENT', before);
    if (event.get('name') === 'snapshot') {
      before = Immutable.fromJS({});
    }
    entity[es].version = event.get('version');
    console.log('CHANGESET FOR APPLYING EVENT', event.get('changeset'));
    entity[es].data = patch(before, event.get('changeset'));
    console.log('DATA AFTER APPLYING EVENT', entity[es].data);
  }
  static inspect(entity) {
    const spec = {};
    spec.version = entity[es].version;
    spec.history = entity[es].history;
    spec.data = entity[es].data;
    spec.commands = entity[cqrs].commands;
    return spec;
  }
}


module.exports = Entity;
