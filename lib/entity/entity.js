const EventEmitter = require('events');
const nlp = require('nlp_compromise');
const Immutable = require('immutable');
const diff = require('immutablediff');
const patch = require('immutablepatch');

/**
 * These symbols are used as keys for some "private" properties in Entity.
 */
const cqrs = Symbol();
const es = Symbol();
const emitter = Symbol();

/**
 * We use a Proxy to trap certain operations so Entity works as expected:
 *
 * 1. We trap every get operation to check if the operation refers to a command
 *    and, if so, we route it to the registered CQRS commands.
 * 2. We trap set operations to ensure state is kept to par with the entity
 *    instance's data.
 */
const traps = {
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
    entity[es].state = entity[es].state.set(key, value);
    entity[key] = entity[es].state.get(key);
    return true;
  },
};

/**
 * EventSourced Entity Class.
 *
 * This class combines Event Sourcing and CQRS concepts with an event emitter.
 * We are doing so through composition at the class level using Symbols to
 * hide some of the complexity and keep the instances as clean as possible.
 *
 * * Event sourcing attributes are referenced through this[es].*
 * * CQRS attributes (commands for now) are referenced through this[cqrs].*
 * * The Event Emitter is referenced through this[emitter].*
 *
 * One of the main goals of this class is to create instances that are as clean
 * as possible and allow users to set and get attributes as they normally would
 * in JavaScript while automatically maintaining state, event history, etc. This
 * is why we use Symbols to store internals.
 */
class Entity {
  constructor(events = [], options = {}) {
    this[es] = {};
    this[es].version = 0;
    this[es].history = Array.isArray(events) ? events : [events];
    this[es].state = Immutable.fromJS({});
    this[es].mappings = {};
    this[emitter] = new EventEmitter();
    this[cqrs] = {};
    this[cqrs].commands = {};

    Entity.commands(this).forEach(command => {
      Entity.command(this, command, this[command]);
    });
    Object.assign(this[es].mappings, options.mappings);

    const proxy = new Proxy(this, traps);

    this[es].history.forEach(event => Entity.apply(event, this));

    return proxy;
  }
  on(event, listener) {
    this[emitter].on(event, listener);
  }
  emit(event, data) {
    this[emitter].emit(event, data);
  }

  /**
   * Get a list of commands defined on the entity.
   *
   * @param {Entity} entity The entity being acted on.
   */
  static commands(entity) {
    const prototype = Object.getPrototypeOf(entity);
    const commands = Object.getOwnPropertyNames(prototype);
    commands.shift();
    return commands;
  }

  /**
   * Register a command. Here we take a function and register it under the CQRS
   * property in the target using the passed command name. Additionaly, the
   * function is wrapped so the following happens:
   *
   * 1. The state of the entity BEFORE executing the function is held in memory.
   * 2. The VALUE returned by the function is held in memory.
   * 3. The state AFTER executing the function ir held in memory.
   * 4. The before and after states are compared by way of diff.
   * 5. If the function has any effect on state AND returns null or undefined,
   * we create, apply, record and emit an event.
   *
   * @param {Entity} target The entity the command is being registered on.
   * @param {String} command The name of the commmand being registered.
   * @param {Function} fn The function being registered.
   */
  static command(target, command, fn) {
    const entity = target;
    entity[cqrs].commands[command] = function cmd(...args) {
      const before = this[es].state;
      const value = fn.apply(this, args);
      const after = Immutable.fromJS(this);
      const changeset = diff(before, after);
      if ((!value || value === null) && changeset.size > 0) {
        // If executing function returns any value other than undefined or null,
        // it will be treated as a query and therefore changes will not be
        // recorded into history.
        const event = Immutable.fromJS({
          name: this[es].mappings[command] || nlp.verb(command).conjugate().past,
          version: this[es].version + 1,
          changeset,
        });
        Entity.apply(event, this);
        this[es].history.push(event);
        this[emitter].emit(event.get('name'), event);
      }
      return null;
    };
  }

  /**
   * Create a snapshot of an entity.
   *
   * Here we return an immutable diff using an empty object as base and the
   * current state of the entity. This essentially gives us a patch that can be
   * applied like any other changeset except the expectation is that it will be
   * applied to an empty object.
   *
   * @param {Entity} entity The entity being snapshotted.
   */
  static snapshot(entity) {
    const event = Immutable.fromJS({
      name: 'snapshot',
      version: entity[es].version,
      changeset: diff(Immutable.fromJS({}), entity[es].state),
    });
    entity[emitter].emit(event.get('name'), event);
    return entity[es].state.toObject();
  }

  /**
   * Apply an event to the entity.
   *
   * Take an event as expected by this library and apply it to the entity. If it
   * is a snapshot event, reset the state to be an empty object.
   *
   * @param {Object} event The event being applied.
   * @param {Entity} target The entity being acted on.
   */
  static apply(event, target) {
    const entity = target;
    let before = entity[es].state;
    if (event.get('name') === 'snapshot') {
      before = Immutable.fromJS({});
    }
    entity[es].version = event.get('version');
    entity[es].state = patch(before, event.get('changeset'));
  }

  /**
   * Inspect an Entity object.
   *
   * Because we are using symbols to hide some internals, inspecting an instance
   * through common means is not possible. This makes it easy to access
   * important information about the entity.
   *
   * @param {Entity} target The entity being acted on.
   */
  static inspect(entity) {
    const spec = {};
    spec.version = entity[es].version;
    spec.history = entity[es].history;
    spec.state = entity[es].state;
    spec.commands = entity[cqrs].commands;
    return spec;
  }
}


module.exports = Entity;
