# Event Sourced

An Event Sourcing library for Node using ES6, Immutable, NLP and some CQRS.

Work in progress. For now, see [lib/entity/entity.spec.js](lib/entity/entity.spec.js) to get an idea of what it does.

With this small library I'm aiming to provide an easy way to implement event sourced entities in Node. My goal is to be able to do something like this:

```javascript
class MyEntity extends Entity {
  save() {}
  delete() {}
}

// Get some events from some sort of store...
const events = [
  { event: 'saved', patch: { op: "save", path: "/name", value: "Luis" } },
];

// Create an instance with those events... Or none.
const instance = new MyEntity(events); // Instance is created applying events.

assert(instance.name === "Luis"); // State should reflect the state up to the last event.

instance.nickname = "luisgo"; // Instance can be manipulated as usual

const instance.save(); // emit 'saved' event with immutable event data.
const instance.delete(); // emit 'deleted' event with immutable data.
```
