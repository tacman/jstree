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

## Events

jsTree triggers jQuery events and also dispatches native `CustomEvent`s.

For an event like `changed`:

- jQuery event: `changed.jstree`
- native event (preferred): `changed.jstree`
- native compatibility alias: `jstree:changed`

```js
const el = document.getElementById('tree');
el.addEventListener('changed.jstree', (event) => {
  console.log(event.detail);
});
```

Disable native dispatch with `core.dispatch_events: false`.

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

## License

MIT. Keep `LICENSE-MIT` and upstream copyright notices.
