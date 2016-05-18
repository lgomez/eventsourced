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
  },
};

class TestEntity extends Entity {
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
    };
  }
}

const instance = new TestEntity();

tap.equals(Entity.inspect(instance).version, 0, 'Version should be 0.');

instance.on('renamed', () => {
  tap.pass('Should emit "renamed" event');
  tap.equals(Entity.inspect(instance).version, 1, 'Version should be 1.');
  tap.equals(instance.name, fixtures.b.name, `Name should be ${fixtures.b.name}.`);
});
instance.rename(fixtures.b.name);

instance.save();
tap.equals(Entity.inspect(instance).version, 2, 'Version should be 2.');
tap.equals(Entity.inspect(instance).history.length, 2, 'History should contain 2 entries.');

instance.touch();
tap.equals(Entity.inspect(instance).version, 2, 'Version should be 2.');
tap.equals(Entity.inspect(instance).history.length, 2, 'History should contain 2 entries.');

tap.same(Entity.snapshot(instance), {
  name: fixtures.b.name,
  foo: 'bar',
}, 'Snapshot should contain expected data.');


tap.test('Manually registering a command', t => {
  Entity.registerCommand(instance, 'fix', function cmd() {
    this.fixed = true;
  });
  const cmdInRegistry = (Entity.getRegisteredCommandsOf(instance).indexOf('fix') > -1);
  t.ok(cmdInRegistry, 'Successfully registers a command.');
  instance.on('fixed', () => {
    t.pass('Command fires expected event.');
    t.equals(Entity.inspect(instance).version, 3, 'Command increases version.');
    t.equals(instance.fixed, true, 'Command changes state.');
    t.end();
  });
  instance.fix();
});
