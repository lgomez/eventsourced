const EventEmitter = require('events');
const nlp = require('nlp_compromise');

class Entity extends EventEmitter {
  constructor(events = []) {
    super();
    this.version = 0;
    this.history = Array.isArray(events) ? events : [events];
    this.data = {};
    this.commands.forEach(command => {
      this[command.name] = this.wrap(command);
    });
  }
  get commands() {
    const prototype = Object.getPrototypeOf(this);
    const commands = Object.getOwnPropertyNames(prototype);
    commands.shift();
    return commands.map(command => this[command]);
  }
  wrap(fn) {
    const name = fn.name;
    const event = nlp.verb(name).conjugate().past;
    return function wrapped(...args) {
      fn.apply(this, args);
      this.emit(event, this.data);
      return null;
    };
  }
}

module.exports = Entity;
