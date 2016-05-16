const Entity = require('.');
const tap = require('tap');

class TestEntity extends Entity {
  post() {}
  delete() {}
}

const i = new TestEntity();

tap.type(i, TestEntity, 'Instance type should be TestEntity');
tap.equals(i.version, 0, 'Instance version should be 0');
tap.type(i.history, Array, 'Instance history should be an Array');
tap.equals(i.history.length, 0, 'Instance history should be empty');
tap.same(i.data, {}, 'Instance data should be {}');
tap.equals(i.commands.length, 2, 'Instance should have 2 commands');

tap.equals(i.post(), null, 'Instance.post() should return null');
i.on('posted', data => {
  tap.same(data, {}, 'Emitted data should be {}');
});
i.post();

tap.equals(i.delete(), null, 'Instance.delete() should return null');
i.on('deleted', data => {
  tap.same(data, {}, 'Emitted data should be {}');
});
i.delete();
