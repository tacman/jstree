# jsTree v4 (Fork)

This repository is a v4 fork of [vakata/jstree](https://github.com/vakata/jstree) focused on:

- modern no-build demos,
- Stimulus-first usage,
- native DOM events for non-jQuery consumers,
- keeping jQuery as an internal runtime dependency.

The classic jQuery plugin API is still available as a compatibility path.

Core JavaScript source of truth is `src/jstree.js`.
The `dist/` directory is retained for theme assets only.

## Install

```bash
npm install @tacman1123/jstree-esm
```

## Package entry points

- `@tacman1123/jstree-esm` - ESM function API
- `@tacman1123/jstree-esm/module` - direct module API
- `@tacman1123/jstree-esm/browser-module` - browser-global API helpers
- `@tacman1123/jstree-esm/stimulus` - Stimulus controller scaffold
- `@tacman1123/jstree-esm/jquery-plugin` - legacy plugin compatibility path

## ESM function API

```js
import { createTree, getTree, callTree, destroyTree } from '@tacman1123/jstree-esm';

const el = document.getElementById('my-tree');

createTree(el, {
  core: {
    data: [{ text: 'Root', children: [{ text: 'Child' }] }]
  }
});

callTree(el, 'open_all');
const instance = getTree(el);
destroyTree(el);
```

## Stimulus controller usage

```js
import { Application } from '@hotwired/stimulus';
import JsTreeController from '@tacman1123/jstree-esm/stimulus';

const app = Application.start();
app.register('jstree', JsTreeController);
```

The bundled controller is a scaffold and intended for extension in app code.

## Event model (jQuery 4 internal, native public)

This fork keeps jQuery as an internal runtime dependency, but the public event contract is native DOM events.

- use `addEventListener` for app integrations;
- do not rely on jQuery `.on('*.jstree')` in consuming code;
- `event.detail` contains the same payload that jsTree methods pass to `trigger`.

For an event like `changed` the tree dispatches:

- `changed.jstree` (primary native `CustomEvent`)
- `jstree:changed` (legacy native alias)

```js
const el = document.getElementById('tree');

el.addEventListener('changed.jstree', (event) => {
  const { action, selected, node } = event.detail;
  console.log(action, selected, node?.id);
});
```

Disable native dispatch with `core.dispatch_events: false`.

## Selection and expansion behavior

### Selection APIs

- `select_node(obj, supress_event, prevent_open)`
  - selects one or many nodes;
  - opens parent chain by default;
  - pass `prevent_open: true` to keep current expansion state.
- `deselect_node(obj, supress_event)` removes selection.
- `select_all(supress_event)` / `deselect_all(supress_event)` bulk selection operations.
- `get_selected(full)` returns selected IDs by default, or full node objects when `full` is `true`.

`changed.jstree` is emitted for selection changes unless `supress_event` is `true`.

### Expansion APIs

- `open_node(obj, callback, animation)`
  - loads async nodes when needed, then opens;
  - callback receives `(node, status)`;
  - emits `before_open.jstree`, `open_node.jstree`, then `after_open.jstree`.
- `close_node(obj, animation)` emits `close_node.jstree` then `after_close.jstree`.
- `toggle_node(obj)` opens closed nodes and closes opened nodes.
- `open_all(obj, animation)` / `close_all(obj, animation)` recursively expand or collapse.

### Practical integration notes

- If upstream selection listeners are not firing, switch from jQuery handlers to `addEventListener('changed.jstree', ...)`.
- If selecting a node unexpectedly expands ancestors, call `select_node(id, false, true)`.
- If `open_node` appears to do nothing, verify the target is not already open and that async data loading is succeeding.

## Local development

Start a local server from repository root:

```bash
php -S 127.0.0.1:8000 -t .
```

Then open:

- `http://127.0.0.1:8000/` launcher
- `http://127.0.0.1:8000/demo/modern/index.html` modern Stimulus demo
- `http://127.0.0.1:8000/demo/module/index.html` function API demo
- `http://127.0.0.1:8000/demo/basic/index.html` legacy jQuery API coverage demo
- `http://127.0.0.1:8000/test/unit/index.html` browser unit tests for native event and selection/expansion behavior

## License

MIT. Keep `LICENSE-MIT` and upstream copyright notices.
