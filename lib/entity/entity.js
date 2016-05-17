const EventEmitter = require('events');
const nlp = require('nlp_compromise');
const Immutable = require('immutable');

const cqrs = Symbol();
const es = Symbol();
const emitter = Symbol();

const handlers = {
  get(target, key) {
    const entity = target;
    let value = target[key] || null;
    if (entity[cqrs].commands[key]) {
      value = entity[cqrs].commands[key];
    }
    return value;
  },
};


class Entity {
  constructor(events = [], options = {}) {
    this[es] = {};
    this[es].version = 0;
    this[es].history = events;
    this[es].data = {};
    this[es].mappings = {};
    this[emitter] = new EventEmitter();
    // this[emitter].on('command:post', data => console.log('EMITTED:', data));
    this[cqrs] = {};
    this[cqrs].commands = {};

    Entity.commands(this).forEach(command => {
      Entity.command(this, command, this[command]);
    });
    Object.assign(this[es].mappings, options.mappings);

    return new Proxy(this, handlers);
  }
  on(event, listener) {
    console.log('LISTENER REGISTERED');
    this[emitter].on(event, listener);
  }
  emit(event, payload) {
    console.log('EVENT EMITTED', payload);
    this[emitter].emit(event, payload);
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
      fn.apply(this, args);
      this[es].version += 1;
      const name = this[es].mappings[command] || nlp.verb(command).conjugate().past;
      const event = {
        name: `command:${name}`,
        payload: {
          timestamp: Date.now(),
          version: this[es].version,
        },
      };
      this[es].history.push(event);
      this.emit(event.name, event.payload);
      return null;
    };
    return null;
  }
  static version(entity) {
    return entity[es].version;
  }
  static history(entity) {
    return entity[es].history;
  }
  static data(entity) {
    return entity[es].data;
  }
  static emitter(entity) {
    return entity[emitter];
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
