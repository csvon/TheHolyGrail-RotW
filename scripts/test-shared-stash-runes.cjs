// Run with: node --preserve-symlinks --preserve-symlinks-main scripts/test-shared-stash-runes.cjs
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText, filename);
};
require.extensions['.d.ts'] = require.extensions['.ts'];
const d2s = require('../vendor/d2s/lib');
const d2stash = require('../vendor/d2s/lib/d2/stash');
const itemParser = require('../vendor/d2s/lib/d2/items');
const { BitReader } = require('../vendor/d2s/lib/binary/bitreader');
const constants = require('../vendor/d2s/lib/data/versions/105_constant_data').constants;
d2s.setConstantData(105, constants);
const { countItems, getItemQuantity } = require('../src/utils/itemQuantity.ts');
require('../electron/lib/holyGrailSeedData.ts');
const objects = require('../src/utils/objects.ts');
const { GameMode, GrailType } = require('../src/@types/main.d.ts');
const { runesMapping } = require('../electron/lib/runesMapping.ts');
const normalization = require('../electron/lib/itemNameNormalization.ts');
const { getSunderGrailName } = require('../electron/lib/sunderCharms.ts');
const fixtureDir = path.join(__dirname, '../vendor/d2s/examples/stash/rune-stacks');
const expected = require('./fixtures/shared-stash-runes.json');

// Exercise the actual application methods without starting Electron, storage,
// timers or filesystem watchers. Keep the production method bodies unchanged.
const source = ts.createSourceFile('items.ts', fs.readFileSync(path.join(__dirname, '../electron/lib/items.ts'), 'utf8'), ts.ScriptTarget.Latest, true);
const storeClass = source.statements.find(ts.isClassDeclaration);
const methods = storeClass.members.filter(m => ['parseSave', 'parseSaves'].includes(m.name?.getText(source)));
const compiled = ts.transpileModule(`class TestStore { ${methods.map(m => m.getText(source)).join('\n')} }`, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
let selectedFile;
const dependencies = {
  d2s, d2stash, runesMapping, ...objects, ...normalization, getSunderGrailName, getItemQuantity,
  GameMode, GrailType,
  settingsStore: { getSettings: () => ({ gameMode: GameMode.Softcore, grailType: GrailType.Both }) },
  readFile: fs.promises.readFile, join: path.join, basename: path.basename, extname: path.extname,
  readdirSync: () => [].concat(selectedFile), eventToReply: {}, getHolyGrailSeedData: () => ({}),
  updateDataToListeners: () => {},
};
const TestStore = new Function(...Object.keys(dependencies), compiled + '\nreturn TestStore;')(...Object.values(dependencies));

(async () => {
  for (const [n, counts] of Object.entries(expected)) {
    assert.strictEqual(counts.length, 33);
    selectedFile = `${n}.d2i`;
    const buffer = fs.readFileSync(path.join(fixtureDir, selectedFile));
    const stash = await d2stash.read(buffer);
    assert.strictEqual(stash.pages.length, 6);
    const runes = stash.pages.flatMap(p => p.items).filter(objects.isRune);
    const socketedCounts = {};
    const countSockets = items => items.forEach(item => {
      for (const child of item.socketed_items || []) {
        if (objects.isRune(child)) socketedCounts[child.type] = (socketedCounts[child.type] || 0) + 1;
      }
      countSockets(item.socketed_items || []);
    });
    stash.pages.forEach(page => countSockets(page.items));
    for (let index = 0; index < 33; index++) {
      const code = `r${String(index + 1).padStart(2, '0')}`;
      const matching = runes.filter(i => i.type === code);
      assert.strictEqual(matching.reduce((sum, i) => sum + i.quantity, 0), counts[index], `${n}: ${code}`);
      assert.strictEqual(matching.length, counts[index] ? 1 : 0);
    }
    // Preserve quantity and alignment when serializing stacked items, including
    // the quest-material variant present alongside runes in screenshot pair 2.
    for (const item of stash.pages[5].items) {
      const encoded = await itemParser.writeItem(item, 105, constants, {});
      const reader = new BitReader(encoded);
      const decoded = await itemParser.readItem(reader, 105, constants, {});
      assert.strictEqual(decoded.type, item.type);
      assert.strictEqual(decoded.quantity, item.quantity);
      assert.strictEqual(reader.offset, encoded.length * 8);
      assert.strictEqual(decoded._unknown_data.v105_pre_quantity_value, item._unknown_data.v105_pre_quantity_value);
    }
    const store = new TestStore();
    store.watchPath = fixtureDir;
    store.fileWatcher = {};
    const replies = [];
    await store.parseSaves({ reply: (...args) => replies.push(args) }, fixtureDir, false);
    assert(!replies.some(([name]) => name === 'errorReadingSaveFile'));
    for (let index = 0; index < 33; index++) {
      const code = `r${String(index + 1).padStart(2, '0')}`;
      const name = runesMapping[code].name.toLowerCase();
      const item = store.currentData.availableRunes[name];
      const totalCount = counts[index] + (socketedCounts[code] || 0);
      assert.strictEqual(item ? objects.countInSaves(item) : 0, totalCount, `app total ${n}: ${name}`);
      assert.strictEqual(item ? objects.countUnusedInSaves(item) : 0, counts[index], `app unused ${n}: ${name}`);
      if (item) assert.strictEqual(countItems(item.inSaves[n]), totalCount);
    }
    const total = counts.reduce((a, b) => a + b, 0);
    if (n !== '1') assert.strictEqual(store.currentData.stats[n], total);
    console.log(`Pair ${n}: all 33 rune quantities match; ${total} runes; application counts and item round trips passed.`);
  }
  const mixed = { inSaves: { stash: [{ quantity: 98 }, {}], character: [{ socketed: true }] } };
  assert.strictEqual(objects.countInSaves(mixed), 100);
  assert.strictEqual(objects.countUnusedInSaves(mixed), 99);
  assert.strictEqual(getItemQuantity({ quantity: 0 }), 0);
  assert.strictEqual(getItemQuantity({ quantity: 0, socketed: true }), 1);
  // These real character sockets encode quantity=0. Scan alongside the stash
  // so totals, unused counts and the character's popup count are all exercised.
  selectedFile = ['1.d2i', path.relative(fixtureDir, path.join(__dirname, '../vendor/d2s/examples/chars/105/9/SorcF_before.d2s'))];
  const combinedStore = new TestStore();
  combinedStore.watchPath = fixtureDir;
  combinedStore.fileWatcher = {};
  const combinedReplies = [];
  await combinedStore.parseSaves({ reply: (...args) => combinedReplies.push(args) }, fixtureDir, false);
  assert(!combinedReplies.some(([name]) => name === 'errorReadingSaveFile'));
  for (const source of [combinedStore.currentData.items, combinedStore.currentData.availableRunes]) {
    assert.strictEqual(objects.countInSaves(source.ist), 6);
    assert.strictEqual(objects.countUnusedInSaves(source.ist), 4);
    assert.strictEqual(countItems(source.ist.inSaves.SorcF_before), 2);
    assert(source.ist.inSaves.SorcF_before.every(item => item.socketed && item.quantity === 0));
  }
  console.log('Combined stash and Sorceress: 6 Ist total, 4 unused, 2 socketed.');
  // Ordinary inventory coordinates must never become stack quantities.
  const rune = (await d2stash.read(fs.readFileSync(path.join(fixtureDir, '4.d2i')))).pages[5].items[0];
  const individual = { ...rune, quantity: undefined, alt_position_id: 1, position_x: 9, position_y: 6, _unknown_data: {} };
  const decoded = await itemParser.readItem(new BitReader(await itemParser.writeItem(individual, 105, constants, {})), 105, constants, {});
  assert.strictEqual(decoded.quantity, undefined);
  assert.strictEqual(getItemQuantity(decoded), 1);
  d2s.setConstantData(98, require('../vendor/d2s/lib/data/versions/96_constant_data').constants);
  await d2stash.read(fs.readFileSync(path.join(__dirname, '../vendor/d2s/examples/stash/SharedStashSoftCoreV2.d2i')));
  // A seventh item sector must be included; metadata sectors must be skipped.
  const fourth = fs.readFileSync(path.join(fixtureDir, '4.d2i'));
  const extraPage = await d2stash.read(Buffer.concat([fourth, fourth.subarray(340, 771)]));
  assert.strictEqual(extraPage.pages.length, 7);
  assert.strictEqual(extraPage.pages[6].items.length, 33);
  const corrupt = Buffer.from(fourth);
  corrupt.writeUInt32LE(0, 16);
  await assert.rejects(() => d2stash.read(corrupt), /Invalid shared stash sector size/);
  // The pre-property marker on ordinary equipment must keep its existing
  // interpretation; the optional quest-material value cannot be read there.
  const characterDir = path.join(__dirname, '../vendor/d2s/examples/chars/105');
  const characterFiles = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? characterFiles(path.join(dir, entry.name)) : entry.name.endsWith('.d2s') ? [path.join(dir, entry.name)] : []);
  const characters = characterFiles(characterDir);
  for (const file of characters) await d2s.read(fs.readFileSync(file));
  console.log(`${characters.length} existing v105 characters parsed successfully.`);
  console.log('Mixed stacks, socketed runes, individual runes, and legacy stash compatibility passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
