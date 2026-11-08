// Run with: node --preserve-symlinks --preserve-symlinks-main scripts/test-item-inspector.cjs
const assert = require('assert');
const fs = require('fs');
const ts = require('typescript');
const program = ts.createProgram(['electron/lib/itemRequiredLevel.ts'], {
  noEmit: true, strict: true, skipLibCheck: true, types: [],
  target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS,
});
const diagnostics = ts.getPreEmitDiagnostics(program);
assert.strictEqual(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, {
  getCurrentDirectory: () => process.cwd(), getCanonicalFileName: file => file, getNewLine: () => '\n',
}));
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
};
const { getItemRequiredLevel } = require('../electron/lib/itemRequiredLevel.ts');
const { enhanceItem } = require('../vendor/d2s/lib/d2/attribute_enhancer');
const { enhanceItem: enhanceSourceItem } = require('../vendor/d2s/src/d2/attribute_enhancer.ts');
const { constants } = require('../vendor/d2s/lib/data/versions/105_constant_data');
const attr = (name, values) => ({ id: constants.magical_properties.findIndex(p => p?.s === name), name, values });
const mods = [attr('item_maxdamage_percent', [199, 199]), attr('lifedrainmindam', [10]),
  attr('item_magicbonus', [25]), attr('item_addskill_tab', [1, 4, 3]),
  attr('item_fasterattackrate', [30]), attr('item_openwounds', [50])];
const expected = ['item_addskill_tab', 'item_fasterattackrate', 'item_maxdamage_percent',
  'lifedrainmindam', 'item_openwounds', 'item_magicbonus'];
const meatScraper = (type = '9b7', ethereal = 0, penalty = 0) => ({
  type, ethereal, quality: 7, unique_name: 'The Meat Scraper',
  unique_id: constants.unq_items.findIndex(p => p?.n === 'The Meat Scraper'),
  magic_attributes: penalty ? [...mods.slice(0, 3), attr('item_levelreq', [penalty]), ...mods.slice(3)] : mods,
});
for (const enhance of [enhanceItem, enhanceSourceItem]) {
  for (const ethereal of [0, 1]) {
    for (const type of ['9b7', '7o7']) {
      const upgraded = type === '7o7';
      const item = meatScraper(type, ethereal, upgraded ? 7 : 0);
      const before = JSON.stringify(item.magic_attributes);
      enhance(item, constants, 1, { sortProperties: true });
      assert.deepStrictEqual(item.displayed_magic_attributes.filter(p => p.description).map(p => p.name), expected);
      assert.strictEqual(JSON.stringify(item.magic_attributes), before);
      assert.strictEqual(getItemRequiredLevel(item), upgraded ? 52 : 41);
      assert.strictEqual(item.reqstr, (upgraded ? 195 : 80) - (ethereal ? 10 : 0));
      assert.strictEqual(item.reqdex || 0, upgraded ? 75 - (ethereal ? 10 : 0) : 0);
    }
  }
}
for (let index = 0; index <= mods.length; index++) {
  const item = meatScraper();
  item.magic_attributes = [...mods.slice(0, index), attr('item_levelreq', [7]), ...mods.slice(index)];
  enhanceItem(item, constants, 1, { sortProperties: true });
  assert.deepStrictEqual(item.displayed_magic_attributes.filter(p => p.description).map(p => p.name), expected);
}
const socketed = meatScraper('7o7', 1, 7);
socketed.socketed_items = [{ type: 'r33', quality: 2 }];
assert.strictEqual(getItemRequiredLevel(socketed), 76); // Zod level 69 plus upgrade penalty.
const set = constants.set_items.find(p => p?.rl > 0);
assert.strictEqual(getItemRequiredLevel({ type: set.c, quality: 5, set_name: set.n }),
  Math.max(set.rl, (constants.armor_items[set.c] || constants.weapon_items[set.c] || constants.other_items[set.c]).rl || 0));
assert.strictEqual(getItemRequiredLevel({ type: 'unknown', quality: 7, magic_attributes: [attr('item_levelreq', [7])] }), undefined);
console.log('Item inspector checks passed: property order, normal/ethereal upgrades, requirements, sockets, and sets.');
