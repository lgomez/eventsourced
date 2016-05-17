const Entity = require('.');
const Map = require('immutable').Map;
const tap = require('tap');
const nlp = require('nlp_compromise');

class TestEntity extends Entity {
  constructor(events, options) {
    super(events, options);
    this.name = 'Luis';
    this.email = 'lgomez@gmail.com';
  }
  post() {
    console.log('TestEntity.post()');
  }
  set(email) {
    console.log('TestEntity.set()');
    this.email = email;
  }
  change(name) {
    this.name = name;
  }
  delete() {}
}



const i = new TestEntity();

// console.log(i);
i.on('command:post', payload => {
  console.log('EVENT RECEIVED', payload);
});
console.log(i.post());
console.log(i.set('new@email.com'));
// console.log(Entity.commands(i));
// console.log(Entity.version(i));
// console.log(Entity.history(i));
// console.log(Entity.data(i));
console.log(Entity.inspect(i));

// const i = new Entity(new TestEntity());
//
// console.log(i.name);
// console.log(i.post());
//
//
// const b = new Entity(new TestEntity());
//
// console.log(b.name);
// console.log(b.post());
// setTimeout(() => {
//   console.log(b.post());
// }, 500);
//
// Entity.getHistoryOf(b);
// Entity.getVersionOf(b);
// Entity.getStateOf(b);



// tap.type(i, TestEntity, 'Instance type should be TestEntity');
// tap.equals(i.version, 0, 'Instance version should be 0');
// tap.type(i.history, Array, 'Instance history should be an Array');
// tap.equals(i.history.length, 0, 'Instance history should be empty');
// tap.ok(i.data.equals(Map({})), 'Instance data should be {}');
// tap.equals(i.commands.length, 4, 'Instance should have 2 commands');

// tap.equals(i.post(), null, 'Instance.post() should return null');
// i.on('posted', data => {
//   tap.equals(data, i.data, 'Emitted data should be {}');
// });
// i.post();

// tap.equals(i.delete(), null, 'Instance.delete() should return null');
// i.on('deleted', data => {
//   tap.same(data, {}, 'Emitted data should be {}');
// });
// i.delete();

// console.log(i.events);

// console.log(nlp.verb('set').conjugate().past);
// console.log(nlp.verb('change').conjugate().past);
// console.log(nlp.verb('changeEmail').conjugate().past);
//
// console.log(nlp.verb('set').conjugate().infinitive);
// console.log(nlp.verb('changed').conjugate().infinitive);
// console.log(nlp.verb('changeEmailed').conjugate().infinitive);
