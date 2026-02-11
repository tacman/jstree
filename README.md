# jstree

[jsTree](http://www.jstree.com/) is jquery plugin, that provides interactive trees. It is absolutely free, [open source](https://github.com/vakata/jstree) and distributed under the MIT license.

jsTree is easily extendable, themable and configurable, it supports HTML & JSON data sources, AJAX & async callback loading.

jsTree functions properly in either box-model (content-box or border-box), can be loaded as an AMD module, and has a built in mobile theme for responsive design, that can easily be customized. It triggers jQuery events and can also dispatch native DOM CustomEvents (`jstree:<event>`), so both jQuery and non-jQuery consumers can bind callbacks.

You also get:
 * drag & drop support
 * keyboard navigation
 * inline edit, create and delete
 * tri-state checkboxes
 * fuzzy searching
 * customizable node types

_For more information, examples and API docs head on over to [the wiki page](https://github.com/vakata/jstree/wiki) and [jstree.com](http://www.jstree.com)_.
_Feel free to ask any questions on the [discussions board](https://github.com/vakata/jstree/discussions)._
_The PHP demos are now in a [separate repository](https://github.com/vakata/jstree-php-demos)._

## Local testing from this repository

Start a local web server from the repository root:

```bash
php -S 127.0.0.1:8000 -t .
```

Make sure dependencies are installed first (`npm install`), since local demo pages load jQuery from `node_modules/jquery/dist/jquery.js`.

Then open:

- `http://127.0.0.1:8000/` (launcher page)
- `http://127.0.0.1:8000/demo/basic/index.html`
- `http://127.0.0.1:8000/demo/module/index.html` (function-based API demo)
- `http://127.0.0.1:8000/test/visual/desktop/index.html`
- `http://127.0.0.1:8000/test/visual/mobile/index.html`
- `http://127.0.0.1:8000/test/unit/index.html`

## ESM API (function-based)

jsTree is still fully available as the classic jQuery plugin (`$(selector).jstree(...)`).

A function-based ESM API is available for module-based projects:

```js
import { createTree, getTree, callTree, destroyTree } from '@tacman/jstree-esm';

const el = document.getElementById('my-tree');

createTree(el, {
  core: {
    data: [{ text: 'Root node', children: [{ text: 'Child node' }] }]
  }
});

const tree = getTree(el);
callTree(el, 'open_all');
destroyTree(el);
```

This works well in Stimulus controllers where `el` is typically `this.element` or a target.

This module API keeps jQuery internal while allowing non-`$().jstree(...)` invocation.

For browser-only pages without bundlers, load `jquery` and `dist/jstree.js` first, then import from `jstree.browser-module.js`.

### Native DOM events

In addition to jQuery events like `changed.jstree`, jsTree now dispatches native browser events by default:

- `jstree:ready`
- `jstree:changed`
- `jstree:open_node`

Listen with standard APIs:

```js
const el = document.getElementById('tree');
el.addEventListener('jstree:changed', (event) => {
  console.log(event.detail);
});
```

Disable this if needed using `core.dispatch_events: false`.

## Fork Publishing and Attribution

Yes, you can publish from your fork. Use a new package name (the unscoped `jstree` name is already owned upstream).

Planned package name for this fork:

- `@tacman/jstree-esm`

Publish steps:

```bash
npm login
npm publish --access public
```

Attribution checklist:

- Keep `LICENSE-MIT` unchanged.
- Keep upstream copyright notices in source headers.
- State clearly in your README that this is a fork of `vakata/jstree`.
- Link to the upstream repository and mention major changes in your fork.

## License & Contributing

_Please do NOT edit files in the "dist" subdirectory as they are generated via grunt. You'll find source code in the "src" subdirectory!_

If you want to you can always [sponsor me](https://github.com/sponsors/vakata) or [donate a small amount][paypal] to help the development of jstree.

[paypal]: https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=paypal@vakata.com&currency_code=USD&amount=&return=http://jstree.com/donation&item_name=Buy+me+a+coffee+for+jsTree

Copyright (c) 2020 Ivan Bozhanov (http://vakata.com)

Licensed under the [MIT license](http://www.opensource.org/licenses/mit-license.php).
