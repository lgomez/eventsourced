const Entity = require('.');
const tap = require('tap');

const testname = 'Luis';
let state = null;

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

const i = new TestEntity();

tap.equals(Entity.inspect(i).version, 0, 'Version should be 0.');

i.on('renamed', () => {
  state = Entity.inspect(i);
  tap.pass('Should emit "renamed" event');
  tap.equals(state.version, 1, 'Version should be 1.');
  tap.equals(i.name, testname, `Name should be ${testname}.`);
});
i.rename(testname);

i.save();
state = Entity.inspect(i);
tap.equals(state.version, 2, 'Version should be 2.');
tap.equals(state.history.length, 2, 'History should contain 2 entries.');

i.touch();
state = Entity.inspect(i);
tap.equals(state.version, 2, 'Version should be 2.');
tap.equals(state.history.length, 2, 'History should contain 2 entries.');

const snapshot = Entity.snapshot(i);
const expected = { name: testname, foo: 'bar' };
tap.same(snapshot, expected, 'Snapshot should contain expected data.');

tap.test('Manually registering a command', t => {
  Entity.registerCommand(i, 'fix', function cmd() {
    this.fixed = true;
  });
  const cmdInRegistry = (Entity.getRegisteredCommandsOf(i).indexOf('fix') > -1);
  t.ok(cmdInRegistry, 'Successfully registers a command.');
  i.on('fixed', () => {
    state = Entity.inspect(i);
    t.pass('Command fires expected event.');
    t.equals(state.version, 3, 'Command increases version.');
    t.equals(i.fixed, true, 'Command changes state.');
    t.end();
  });
  i.fix();
});
