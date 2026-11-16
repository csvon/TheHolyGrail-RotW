// Run with: node --preserve-symlinks --preserve-symlinks-main scripts/test-search-performance.cjs
const assert = require('assert');
const fs = require('fs');
const ts = require('typescript');
const { JSDOM } = require('jsdom');
const { performance } = require('perf_hooks');
const Module = require('module');
const originalLoad = Module._load;
Module._load = function (request, ...args) {
  if (request === '@mui/material/internal/svg-icons/CheckBoxOutlineBlank') {
    request = '@mui/material/node/internal/svg-icons/CheckBoxOutlineBlank';
  }
  return originalLoad.call(this, request, ...args);
};

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.IS_REACT_ACT_ENVIRONMENT = true;
for (const key of ['HTMLElement', 'Element', 'Node', 'DocumentFragment', 'MutationObserver']) {
  global[key] = dom.window[key];
}
let nextFrame = 0;
const frames = new Map();
global.requestAnimationFrame = callback => { frames.set(++nextFrame, callback); return nextFrame; };
global.cancelAnimationFrame = id => frames.delete(id);
const flushFrames = () => {
  const callbacks = [...frames.values()];
  frames.clear();
  act(() => callbacks.forEach(callback => callback()));
};
for (const ext of ['.ts', '.tsx', '.d.ts']) {
  require.extensions[ext] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    // Match the app's Babel build, which also lowers const/let declarations.
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES5, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, downlevelIteration: true },
    fileName: filename.replace(/\.d\.ts$/, '.ts'),
  }).outputText, filename);
}
for (const ext of ['.svg', '.mp3', '.css']) {
  require.extensions[ext] = module => { module.exports = ''; };
}

let historyReads = 0;
const listeners = {};
let history = { tarnhelm: true };
const dropRequests = [];
window.Main = {
  getEverFound: () => { historyReads++; return history; },
  getSetting: () => 'en',
  getStreamPort: () => 3000,
  getRecentFinds: () => [],
  on: (event, listener) => { listeners[event] = listener; },
  getSilospen: (type, name) => dropRequests.push({ type, name }),
};
require('../src/i18n.ts');
const React = require('react');
const { act } = React;
const { createRoot } = require('react-dom/client');
const { flushSync } = require('react-dom');
const { fireEvent, within } = require('@testing-library/dom');
const { List } = require('../src/components/List/index.tsx');
const settings = { ...require('../src/utils/defaultSettings.ts').default, grailWarlock: true, persistFoundOnDrop: true };
const fileReaderResponse = { items: {}, ethItems: {}, stats: {}, availableRunes: {} };
const props = { fileReaderResponse, appSettings: settings, itemNotes: {}, playSound: () => {} };
const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);
act(() => root.render(React.createElement(List, props)));
const view = within(document.body);
act(() => fireEvent.click(view.getByRole('button', { name: 'Search (Ctrl+F, Ctrl+Space)' })));
const input = view.getByRole('textbox');
const beforeSearch = historyReads;
const entries = () => [...container.querySelectorAll('[data-search-result-entry="true"]')];
for (const query of ['a', 'ar', 'ara', 'arachnid']) {
  const previousEntries = entries();
  act(() => {
    const start = performance.now();
    flushSync(() => fireEvent.change(input, { target: { value: query } }));
    console.log(`Input "${query}": ${Math.round(performance.now() - start)} ms`);
    assert.strictEqual(input.value, query, 'Input must update before result rendering');
    assert.deepStrictEqual(entries(), previousEntries, 'Urgent keystrokes must reuse the existing result rows');
  });
}
assert.strictEqual(historyReads, beforeSearch, 'Typing must not perform synchronous history reads');
assert.strictEqual(entries().length, 1);
assert.match(entries()[0].textContent, /Arachnid Mesh/);

// Enter must wait for the latest deferred results rather than opening the old row.
dom.window.HTMLElement.prototype.getClientRects = function () { return this.closest('[hidden]') ? [] : [{}]; };
act(() => {
  flushSync(() => {
    fireEvent.change(input, { target: { value: 'tarnhelm' } });
    fireEvent.keyDown(input, { key: 'Enter' });
  });
  assert.strictEqual(dropRequests.length, 0);
});
flushFrames();
assert.deepStrictEqual(dropRequests, [{ type: 'UNIQUE', name: 'tarnhelm' }]);
assert.match(entries()[0].textContent, /Previously found/);
assert.strictEqual(historyReads, beforeSearch);

// Refresh the shared history when main broadcasts a clear or new saves arrive.
history = {};
act(() => listeners.everFoundCleared());
assert.doesNotMatch(entries()[0].textContent, /Previously found/);
history = { tarnhelm: true };
act(() => root.render(React.createElement(List, { ...props, fileReaderResponse: { ...fileReaderResponse } })));
assert.match(entries()[0].textContent, /Previously found/);

// Only-missing filtering must preserve search for both runes and runewords.
act(() => root.render(React.createElement(List, { ...props, appSettings: { ...settings, onlyMissing: true } })));
const inlineInput = container.querySelector('input[placeholder="Search"]');
for (const query of ['spirit', 'zod', 'no-such-item']) {
  act(() => fireEvent.change(inlineInput, { target: { value: query } }));
  const results = entries();
  if (query === 'spirit') {
    assert.strictEqual(container.querySelectorAll('#simple-tabpanel-6 [data-search-result-entry="true"]').length, 1);
  } else {
    assert.strictEqual(results.length, query === 'no-such-item' ? 0 : 1, `Unexpected missing-only results for ${query}`);
  }
  for (const result of results) assert.match(result.textContent.toLowerCase(), new RegExp(query));
}
// Closing the spotlight and returning home must restore the regular tabs.
act(() => fireEvent.click(view.getByText('The Holy Grail')));
assert.ok(view.getByRole('tab', { name: 'Statistics', selected: true }));
act(() => root.unmount());
dom.window.close();
console.log('Search checks passed: responsive input, no history reads while typing, current-result submit, history refresh, and missing-only filtering.');
