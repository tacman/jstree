test('basic test', function() {
  expect(1);
  ok(true, 'this had better work.');
});


test('can access the DOM', function() {
  expect(1);
  var fixture = document.getElementById('qunit-fixture');
  equal(fixture.innerText || fixture.textContent, 'this had better work.', 'should be able to access the DOM.');
});

test('select_node emits native changed event payload', function(assert) {
  expect(5);
  var done = assert.async();
  var fixture = document.getElementById('qunit-fixture');
  var tree = document.createElement('div');
  tree.id = 'tree-select-event';
  fixture.appendChild(tree);

  var changedDetail = null;
  var changedAliasDetail = null;

  tree.addEventListener('changed.jstree', function(event) {
    changedDetail = event.detail;
  });
  tree.addEventListener('jstree:changed', function(event) {
    changedAliasDetail = event.detail;
  });

  $(tree)
    .on('ready.jstree', function() {
      var instance = $.jstree.reference(tree);
      instance.select_node('child-1', false, true);

      ok(!!changedDetail, 'changed.jstree native event is dispatched');
      ok(!!changedAliasDetail, 'jstree:changed native alias is dispatched');
      equal(changedDetail.action, 'select_node', 'event action is select_node');
      ok(changedDetail.selected.indexOf('child-1') !== -1, 'selected list includes the node id');
      equal(changedDetail.instance, instance, 'event detail includes instance');

      instance.destroy();
      done();
    })
    .jstree({
      core: {
        animation: 0,
        data: [
          {
            text: 'Root',
            state: { opened: true },
            children: [{ id: 'child-1', text: 'Child 1' }]
          }
        ]
      }
    });
});

test('select_node prevent_open keeps parents collapsed', function(assert) {
  expect(2);
  var done = assert.async();
  var fixture = document.getElementById('qunit-fixture');
  var tree = document.createElement('div');
  tree.id = 'tree-prevent-open';
  fixture.appendChild(tree);

  $(tree)
    .on('ready.jstree', function() {
      var instance = $.jstree.reference(tree);

      instance.select_node('leaf', false, true);
      ok(instance.is_closed('parent'), 'parent stays closed when prevent_open is true');

      instance.deselect_all(true);
      instance.select_node('leaf');
      ok(instance.is_open('parent'), 'parent opens when prevent_open is omitted');

      instance.destroy();
      done();
    })
    .jstree({
      core: {
        animation: 0,
        data: [
          {
            id: 'parent',
            text: 'Parent',
            state: { opened: false },
            children: [{ id: 'leaf', text: 'Leaf' }]
          }
        ]
      }
    });
});

test('open_node and close_node dispatch expansion lifecycle events', function(assert) {
  expect(1);
  var done = assert.async();
  var fixture = document.getElementById('qunit-fixture');
  var tree = document.createElement('div');
  tree.id = 'tree-expand-events';
  fixture.appendChild(tree);

  var events = [];
  tree.addEventListener('open_node.jstree', function() { events.push('open_node'); });
  tree.addEventListener('after_open.jstree', function() { events.push('after_open'); });
  tree.addEventListener('close_node.jstree', function() { events.push('close_node'); });
  tree.addEventListener('after_close.jstree', function() { events.push('after_close'); });

  $(tree)
    .on('ready.jstree', function() {
      var instance = $.jstree.reference(tree);
      instance.open_node('parent', function() {
        instance.close_node('parent');
        deepEqual(events, ['open_node', 'after_open', 'close_node', 'after_close'], 'expansion and collapse events fire in order');
        instance.destroy();
        done();
      }, 0);
    })
    .jstree({
      core: {
        animation: 0,
        data: [
          {
            id: 'parent',
            text: 'Parent',
            state: { opened: false },
            children: [{ id: 'leaf-2', text: 'Leaf' }]
          }
        ]
      }
    });
});
