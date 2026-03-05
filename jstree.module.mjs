import $ from 'jquery';
import './src/jstree.js';
import './src/jstree.changed.js';
import './src/jstree.checkbox.js';
import './src/jstree.conditionalselect.js';
import './src/jstree.contextmenu.js';
import './src/jstree.dnd.js';
import './src/jstree.massload.js';
import './src/jstree.search.js';
import './src/jstree.sort.js';
import './src/jstree.state.js';
import './src/jstree.types.js';
import './src/jstree.unique.js';
import './src/jstree.wholerow.js';

function ensureTarget(target) {
  if (target === undefined || target === null) {
    throw new Error('A target element, selector, or jQuery object is required.');
  }
}

export function createTree(target, options) {
  ensureTarget(target);
  return $.jstree.create(target, options);
}

export function getTree(target) {
  ensureTarget(target);
  return $.jstree.reference(target);
}

export function hasTree(target) {
  ensureTarget(target);
  return !!$.jstree.reference(target);
}

export function callTree(target, method, ...args) {
  ensureTarget(target);
  const instance = $.jstree.reference(target);
  if (!instance) {
    throw new Error('No jsTree instance found for the provided target.');
  }
  if (!method || typeof instance[method] !== 'function') {
    throw new Error(`Unknown jsTree method: ${String(method)}`);
  }
  return instance[method](...args);
}

export function destroyTree(target) {
  if (target === undefined || target === null) {
    $.jstree.destroy();
    return true;
  }

  const instance = $.jstree.reference(target);
  if (!instance) {
    return false;
  }

  instance.destroy();
  return true;
}

export function configureDefaults(defaults) {
  $.extend(true, $.jstree.defaults, defaults || {});
  return $.jstree.defaults;
}

export function getJQuery() {
  return $;
}

export const version = $.jstree && $.jstree.version ? $.jstree.version : undefined;

export default {
  createTree,
  getTree,
  hasTree,
  callTree,
  destroyTree,
  configureDefaults,
  getJQuery,
  version
};
