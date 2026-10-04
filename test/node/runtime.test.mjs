import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://tree.test/', pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
const api = await import('../../jstree.esm.mjs');
const $ = api.getJQuery();
after(() => dom.window.close());

async function fixture(options = {}) {
    const el = document.createElement('div');
    document.body.append(el);
    const ready = new Promise(resolve => $(el).one('ready.jstree', resolve));
    const tree = api.createTree(el, {
        plugins: ['search', 'types', 'contextmenu', 'dnd', 'checkbox', 'state'],
        ...options,
        core: {
            animation: 0, worker: false, check_callback: true,
            themes: { url: false },
            data: [{ id: 'root', text: 'Root', children: [{ id: 'child', text: 'Child' }] }],
            ...options.core,
        },
    });
    await ready;
    return { el, tree, close() { api.destroyTree(el); el.remove(); } };
}

test('ESM entry uses jQuery 4 and exposes the release version', () => {
    assert.equal($.fn.jquery, '4.0.0');
    assert.equal(typeof api.createTree, 'function');
    assert.equal(api.version, '4.2.0');
});

test('CRUD emits one canonical native event per operation and no legacy alias by default', async () => {
    const f = await fixture();
    try {
        const counts = {};
        for (const name of ['create_node', 'rename_node', 'move_node', 'delete_node']) {
            for (const type of [`${name}.jstree`, `jstree:${name}`]) {
                counts[type] = 0;
                f.el.addEventListener(type, event => { counts[type]++; assert.equal(event.detail.instance, f.tree); });
            }
        }
        const id = f.tree.create_node('root', { text: 'New' });
        f.tree.rename_node(id, 'Renamed');
        f.tree.move_node(id, 'child');
        assert.equal(f.tree.get_node(id).parent, 'child');
        f.tree.delete_node(id);
        assert.equal(f.tree.get_node(id), false);
        for (const name of ['create_node', 'rename_node', 'move_node', 'delete_node']) {
            assert.equal(counts[`${name}.jstree`], 1);
            assert.equal(counts[`jstree:${name}`], 0);
        }
    } finally { f.close(); }
});

test('native dispatch can be disabled while jQuery plugin events still work', async () => {
    const f = await fixture({ core: { dispatch_events: false } });
    try {
        let native = 0, legacy = 0;
        f.el.addEventListener('rename_node.jstree', () => native++);
        $(f.el).on('rename_node.jstree', () => legacy++);
        f.tree.rename_node('child', 'Updated');
        assert.equal(native, 0);
        assert.equal(legacy, 1);
    } finally { f.close(); }
});

test('search, checkbox, selection, expansion, and destroy work with jQuery 4', async () => {
    const f = await fixture();
    f.tree.search('Child');
    assert.ok(f.el.querySelector('.jstree-search'));
    f.tree.clear_search();
    f.tree.check_node('child');
    assert.ok(f.tree.is_checked('child'));
    f.tree.open_node('root', null, 0);
    assert.ok(f.tree.is_open('root'));
    f.tree.close_node('root', 0);
    f.tree.select_node('child', false, true);
    assert.ok(f.tree.is_closed('root'));
    assert.ok(f.tree.is_selected('child'));
    f.close();
    assert.equal(api.hasTree(f.el), false);
});


test('Stimulus entry imports without a global jQuery plugin', async () => {
    assert.equal(window.jQuery, undefined);
    const { default: Controller } = await import('../../jstree.stimulus.mjs');
    assert.equal(typeof Controller, 'function');
});

test('state save timers belong to each tree and are cancelled on destroy', async () => {
    const first = await fixture({ state: { key: 'first-tree' } });
    const second = await fixture({ state: { key: 'second-tree' } });
    let a = 0, b = 0;
    first.tree.save_state = () => a++;
    second.tree.save_state = () => b++;
    first.tree.select_node('child');
    second.tree.select_node('child');
    await new Promise(resolve => setTimeout(resolve, 150));
    assert.equal(a, 1);
    assert.equal(b, 1);
    first.tree.deselect_all();
    first.close();
    second.close();
    await new Promise(resolve => setTimeout(resolve, 150));
    assert.equal(a, 1, 'destroy cancels pending state writes');
});
