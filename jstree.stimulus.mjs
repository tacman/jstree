import { Controller } from '@hotwired/stimulus';
import { createTree, getTree, destroyTree } from './jstree.browser-module.mjs';

const TREE_EVENTS = [
  ['checkboxTree', 'checkbox', 'changed.jstree', 'Checkbox Changed'],
  ['searchTree', 'search', 'changed.jstree', 'Selection Changed'],
  ['ajaxTree', 'ajax', 'loaded.jstree', 'AJAX Loaded'],
  ['ajaxTree', 'ajax', 'refresh.jstree', 'AJAX Refreshed'],
  ['ajaxTree', 'ajax', 'select_node.jstree', 'AJAX Node Selected'],
  ['themedTree', 'themed', 'open_node.jstree', 'Node Opened'],
  ['themedTree', 'themed', 'close_node.jstree', 'Node Closed'],
  ['themedTree', 'themed', 'select_node.jstree', 'Node Selected'],
  ['dndTree', 'dnd', 'move_node.jstree', 'Node Moved'],
  ['dndTree', 'dnd', 'create_node.jstree', 'Node Created'],
  ['dndTree', 'dnd', 'delete_node.jstree', 'Node Deleted'],
  ['dndTree', 'dnd', 'rename_node.jstree', 'Node Renamed']
];

export class JsTreeController extends Controller {
  static targets = ['checkboxTree', 'searchTree', 'ajaxTree', 'themedTree', 'dndTree', 'searchInput', 'checkboxLog', 'searchLog', 'ajaxLog', 'themedLog', 'dndLog'];

  connect() {
    this._eventCleanup = [];
    this.initTrees();
    this.bindNativeTreeEvents();
  }

  disconnect() {
    this._eventCleanup.forEach((cleanup) => cleanup());
    this._eventCleanup = [];
    this.eachTreeElement((element) => {
      destroyTree(element);
    });
  }

  search(event) {
    if(event && event.type === 'keydown' && event.key !== 'Enter') {
      return;
    }
    if(event) {
      event.preventDefault();
    }
    const query = this.searchInputTarget.value.trim();
    const tree = this.tree(this.searchTreeTarget);
    if(tree && query) {
      tree.search(query);
      this.logEvent('search', 'Search', { text: query });
    }
  }

  clearSearch(event) {
    if(event) {
      event.preventDefault();
    }
    const tree = this.tree(this.searchTreeTarget);
    if(tree) {
      tree.clear_search();
    }
    this.searchInputTarget.value = '';
    this.logEvent('search', 'Clear Search', {});
  }

  expandAll(event) {
    if(event) {
      event.preventDefault();
    }
    this.eachTree((tree) => tree.open_all());
    this.logEventAll('Expand All', {});
  }

  collapseAll(event) {
    if(event) {
      event.preventDefault();
    }
    this.eachTree((tree) => tree.close_all());
    this.logEventAll('Collapse All', {});
  }

  selectAll(event) {
    if(event) {
      event.preventDefault();
    }
    const tree = this.tree(this.checkboxTreeTarget);
    if(tree) {
      tree.select_all();
    }
    this.logEvent('checkbox', 'Select All', {});
  }

  deselectAll(event) {
    if(event) {
      event.preventDefault();
    }
    const tree = this.tree(this.checkboxTreeTarget);
    if(tree) {
      tree.deselect_all();
    }
    this.logEvent('checkbox', 'Deselect All', {});
  }

  getSelected(event) {
    if(event) {
      event.preventDefault();
    }
    const tree = this.tree(this.checkboxTreeTarget);
    const selected = tree ? tree.get_selected(true) : [];
    const labels = selected.map((node) => node.text).join(', ');
    this.logEvent('checkbox', 'Get Selected', { selected: selected.length, texts: labels });
    window.alert(`Selected: ${selected.length} nodes\n${labels}`);
  }

  setThemeSmall(event) {
    if(event) {
      event.preventDefault();
    }
    this.applyThemeSize('small');
  }

  setThemeLarge(event) {
    if(event) {
      event.preventDefault();
    }
    this.applyThemeSize('large');
  }

  setThemeNormal(event) {
    if(event) {
      event.preventDefault();
    }
    this.applyThemeSize('');
  }

  refreshAjax(event) {
    if(event) {
      event.preventDefault();
    }
    const tree = this.tree(this.ajaxTreeTarget);
    if(tree) {
      tree.refresh();
      this.logEvent('ajax', 'Reload AJAX', {});
    }
  }

  addNode(event) {
    if(event) {
      event.preventDefault();
    }
    const tree = this.tree(this.dndTreeTarget);
    if(!tree) {
      return;
    }

    const selected = tree.get_selected();
    const parent = selected.length ? selected[0] : '#';
    const nodeId = tree.create_node(parent, { text: 'New node' }, 'last');
    if(!nodeId) {
      this.logEvent('dnd', 'Add Node Failed', {});
      return;
    }

    tree.open_node(parent);
    tree.deselect_all();
    tree.select_node(nodeId);
    tree.edit(nodeId);
    this.logEvent('dnd', 'Add Node', { node: tree.get_node(nodeId) });
  }

  deleteNode(event) {
    if(event) {
      event.preventDefault();
    }
    const tree = this.tree(this.dndTreeTarget);
    if(!tree) {
      return;
    }

    const selected = tree.get_selected();
    if(!selected.length) {
      this.logEvent('dnd', 'Delete Selected', { selected: 0 });
      return;
    }
    tree.delete_node(selected);
    this.logEvent('dnd', 'Delete Selected', { selected: selected.length });
  }

  logClick(event) {
    const anchor = event.target.closest('.jstree-anchor');
    if(anchor) {
      this.logEvent(this.logKeyForElement(anchor), 'Click', { text: anchor.textContent.trim() });
    }
  }

  initTrees() {
    createTree(this.checkboxTreeTarget, {
      plugins: ['checkbox'],
      core: { themes: this.baseThemes() }
    });

    createTree(this.searchTreeTarget, {
      plugins: ['search'],
      core: { themes: this.baseThemes() }
    });

    createTree(this.ajaxTreeTarget, {
      core: {
        themes: this.baseThemes(),
        data: {
          url: '/demo/modern/ajax-root.json',
          dataType: 'json'
        }
      }
    });

    createTree(this.themedTreeTarget, {
      plugins: [],
      core: { themes: this.baseThemes() }
    });

    createTree(this.dndTreeTarget, {
      plugins: ['dnd', 'contextmenu'],
      core: {
        check_callback: true,
        themes: this.baseThemes()
      },
      contextmenu: {
        items: {
          create: {
            label: 'Add child',
            action: (data) => {
              const tree = getTree(data.reference);
              const node = tree.get_node(data.reference);
              const parent = node ? node.id : '#';
              const created = tree.create_node(parent, { text: 'New node' }, 'last');
              if(created) {
                tree.edit(created);
              }
            }
          },
          rename: {
            label: 'Rename',
            action: (data) => {
              const tree = getTree(data.reference);
              const selected = tree.get_selected();
              if(selected.length) {
                tree.edit(selected[0]);
              }
            }
          },
          remove: {
            label: 'Delete',
            action: (data) => {
              const tree = getTree(data.reference);
              const selected = tree.get_selected();
              if(selected.length) {
                tree.delete_node(selected);
              }
            }
          }
        }
      }
    });
  }

  baseThemes() {
    return {
      name: false,
      url: false,
      dots: false,
      icons: false
    };
  }

  bindNativeTreeEvents() {
    TREE_EVENTS.forEach(([targetName, logKey, eventName, label]) => {
      const element = this[`${targetName}Target`];
      const handler = (event) => {
        this.logEvent(logKey, label, event.detail || {});
      };
      element.addEventListener(eventName, handler);
      this._eventCleanup.push(() => element.removeEventListener(eventName, handler));
    });
  }

  applyThemeSize(size) {
    const element = this.themedTreeTarget;
    element.className = element.className.replace(/\s*jstree-(small|large)/g, '');
    if(size) {
      element.className += ` jstree-${size}`;
    }
    this.logEvent('themed', 'Theme Changed', { size: size || 'normal' });
  }

  tree(element) {
    return getTree(element);
  }

  eachTree(callback) {
    this.eachTreeElement((element) => {
      const tree = this.tree(element);
      if(tree) {
        callback(tree, element);
      }
    });
  }

  eachTreeElement(callback) {
    [this.checkboxTreeTarget, this.searchTreeTarget, this.ajaxTreeTarget, this.themedTreeTarget, this.dndTreeTarget].forEach(callback);
  }

  logKeyForElement(element) {
    const treeElement = element.closest('#checkbox-tree, #search-tree, #ajax-tree, #themed-tree, #dnd-tree');
    if(treeElement === this.checkboxTreeTarget) {
      return 'checkbox';
    }
    if(treeElement === this.searchTreeTarget) {
      return 'search';
    }
    if(treeElement === this.ajaxTreeTarget) {
      return 'ajax';
    }
    if(treeElement === this.themedTreeTarget) {
      return 'themed';
    }
    if(treeElement === this.dndTreeTarget) {
      return 'dnd';
    }
    return null;
  }

  logElement(logKey) {
    if(logKey === 'checkbox' && this.hasCheckboxLogTarget) {
      return this.checkboxLogTarget;
    }
    if(logKey === 'search' && this.hasSearchLogTarget) {
      return this.searchLogTarget;
    }
    if(logKey === 'ajax' && this.hasAjaxLogTarget) {
      return this.ajaxLogTarget;
    }
    if(logKey === 'themed' && this.hasThemedLogTarget) {
      return this.themedLogTarget;
    }
    if(logKey === 'dnd' && this.hasDndLogTarget) {
      return this.dndLogTarget;
    }
    return null;
  }

  logEventAll(type, data) {
    ['checkbox', 'search', 'ajax', 'themed', 'dnd'].forEach((key) => this.logEvent(key, type, data));
  }

  logEvent(logKey, type, data) {
    const output = this.logElement(logKey);
    if(!output) {
      return;
    }
    const time = new Date().toLocaleTimeString();
    const item = document.createElement('div');
    item.className = 'event-item';

    let detail = '';
    if(data && data.node) {
      detail = `Node: "${data.node.text || data.node.id}"`;
    }
    if(data && Array.isArray(data.selected) && data.selected.length) {
      detail = `Selected: ${data.selected.length} nodes`;
    }
    if(data && typeof data.selected === 'number') {
      detail = `Selected: ${data.selected} nodes`;
    }

    item.innerHTML = `<span class="event-time">[${time}]</span> ${type}: ${detail}`;
    output.insertBefore(item, output.firstChild);

    while(output.children.length > 20) {
      output.removeChild(output.lastChild);
    }
  }
}

export default JsTreeController;
