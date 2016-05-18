# Event Sourced

[![Build Status](https://travis-ci.org/lgomez/eventsourced.svg?branch=master)](https://travis-ci.org/lgomez/eventsourced)
[![Coverage Status](https://coveralls.io/repos/github/lgomez/eventsourced/badge.svg?branch=master)](https://coveralls.io/github/lgomez/eventsourced?branch=master)

An Event Sourcing library for Node using ES6, Immutable, NLP and some CQRS.

Combining Event Sourcing and CQRS concepts in one Entity class for node using ES6 Symbols, Proxies, Immutable and Event Emitter. One of the main goals with the Entity class is to create instances that are as clean as possible and allow users to set and get attributes as they normally would in JavaScript while automatically maintaining state, event history, etc.

## Warning

Only available for Node 6. We will be adding distributions for older versions but haven't gotten around to it yet. Stay tunned.

This is very much a work in progress and not ready for use. For now, see [lib/entity/entity.spec.js](lib/entity/entity.spec.js) to get an idea of what it does.

## Installation

```bash
npm i eventsourced
```

## Usage

```javascript
var Entity = require('eventsourced');

class MyEntity extends Entity {
  /**
   * The constructor is required now but will be removed because it makes no
   * sense in an event sourced entity.
   */
  constructor(events, options) {
    super(events, options);
    this.name = 'Luis';
    this.email = 'lgomez@example.com';
  }
  /**
   * Commands change state and return undefined or null.
   */
  rename(name) {
    this.name = name;
  }
  save() {
    this.foo = 'bar';
    return null;
  }
  /**
   * A command that does not change state does not cause an event to be emitted.
   * It is considered to be a query and not a command.
   */
  touch() {
  }
  /**
   * A query method does return something but does not change state.
   */
  myQuery() {
    return {
      type: 'query response',
      name: this.name,
      email: this.email,
    };
  }
}

const entity = new MyEntity();

a.rename('Daniel'); // Sets name to Daniel, changes state, emits renamed event.
a.save(); // Sets foo to bar, changes state, emits saved event.
a.touch(); // Does nothing, does not emit event.
```

## Testing

One-off tests can be run as usual:

```bash
npm test
```

Or you can use `npm start` to continuously run tests on every change.

```bash
npm start
```
