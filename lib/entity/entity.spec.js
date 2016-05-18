const Entity = require('.');
const tap = require('tap');

const fixtures = {
  a: {
    name: 'Luis',
    email: 'l@example.com',
  },
  b: {
    name: 'Daniel',
    email: 'd@example.com',
  }
};

class TestEntity extends Entity {
  constructor(events, options) {
    super(events, options);
    this.name = fixtures.a.name;
    this.email = fixtures.a.email;
  }
  rename(name) {
    this.name = name;
  }
  save() {
    this.foo = 'bar';
  }
  touch() {
  }
  myQuery() {
    return {
      type: 'query response',
      name: this.name,
      email: this.email,
    }
  }
}

// console.log('CREATING INSTACE A');
const a = new TestEntity();

tap.equals(Entity.inspect(a).version, 0, 'Instance version should be 0');
tap.equals(a.name, fixtures.a.name, `Instance name should be ${fixtures.a.name}`);


a.rename(fixtures.b.name);
tap.equals(Entity.inspect(a).version, 1, 'Instance version should be 1');
tap.equals(a.name, fixtures.b.name, `Instance name should be ${fixtures.b.name}`);

a.save();
tap.equals(Entity.inspect(a).version, 2, 'Instance version should be 2');
tap.equals(Entity.inspect(a).history.length, 2, 'Instance history should contain 2 entries');

a.touch();
tap.equals(Entity.inspect(a).version, 2, 'Instance version should be 2');
tap.equals(Entity.inspect(a).history.length, 2, 'Instance history should contain 2 entries');

tap.same(Entity.snapshot(a), {
  name: fixtures.b.name,
  email: fixtures.a.email,
  foo: 'bar',
}, 'Instance snapshot should...');

// tap.test('Instance should emit "saved" event', t => {
//   i.on('saved', () => {
//     t.equals(Entity.version(i), 1, 'Instance version should be 1');
//     t.equals(Entity.history(i).length, 1, 'Instance history should have one event');
//     // t.same(Entity.snapshot(i), {
//     //   version: 1,
//     //   changeset: i,
//     // }, 'Instance snapshot should...');
//     t.end();
//   });
//   i.save();
// });
//
// tap.test('Instance should emit "renamed" event', t => {
//   i.on('renamed', () => {
//     t.equals(Entity.version(i), 2, 'Instance version should be 2');
//     t.equals(Entity.history(i).length, 2, 'Instance history should have two events');
//     // t.same(Entity.snapshot(i), {
//     //   version: 2,
//     //   changeset: i,
//     // }, 'Instance snapshot should...');
//     t.end();
//   });
//   i.rename('Peter');
// });
//
// tap.test('Instance should emit "touched" event', t => {
//   i.on('touched', () => {
//     t.equals(Entity.version(i), 3, 'Instance version should be 3');
//     t.equals(Entity.history(i).length, 3, 'Instance history should have three events');
//     // t.same(Entity.snapshot(i), {
//     //   version: 3,
//     //   changeset: i,
//     // }, 'Instance snapshot should...');
//     t.end();
//   });
//   i.touch();
// });
//
// tap.test('Registering a command', t => {
//   Entity.command(i, 'fix', function cmd() {
//     this.fixed = true;
//   });
//   i.on('fixed', () => {
//     t.equals(Entity.version(i), 4, 'Instance version should be 4');
//     t.equals(Entity.history(i).length, 4, 'Instance history should have four events');
//     t.end();
//   });
//   i.fix();
// });
//
// tap.test('Recreating an entity from a snapshot', t => {
//   const b = new TestEntity(Entity.snapshot(i));
//   console.log(Entity.inspect(b));
//   t.end();
// });



// console.log(Entity.inspect(i));


// console.log(i.set('new@email.com'));
// console.log(Entity.commands(i));
// console.log(Entity.version(i));
// console.log(Entity.history(i));
// console.log(Entity.data(i));
// console.log(Entity.inspect(i));

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
