// Run with: node scripts/test-sunder-charms.cjs
const assert = require('assert');
const fs = require('fs');
const ts = require('typescript');
const path = require('path');
const program = ts.createProgram([
  path.join(__dirname, '../electron/lib/sunderCharms.ts'),
  path.join(__dirname, '../electron/lib/itemNameNormalization.ts'),
], {
  noEmit: true, strict: true, skipLibCheck: true, types: [],
  target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS,
});
const diagnostics = ts.getPreEmitDiagnostics(program);
assert.strictEqual(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, {
  getCurrentDirectory: () => process.cwd(), getCanonicalFileName: file => file, getNewLine: () => '\n',
}));
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    fileName: filename.replace(/\.d\.ts$/, '.ts'),
  });
  module._compile(outputText, filename);
};
// Match Webpack's .d.ts resolution: this project keeps runtime enums there.
require.extensions['.d.ts'] = require.extensions['.ts'];

const { normalizeParsedUniqueOrSetLookupName: normalize } = require('../electron/lib/itemNameNormalization.ts');
const { mergeSunderHistory, mergeSunderItems } = require('../electron/lib/sunderCharms.ts');
const { getHolyGrailSeedData } = require('../electron/lib/holyGrailSeedData.ts');
const { computeSubStats } = require('../src/utils/objects.ts');
const { GrailType } = require('../src/@types/main.d.ts');
const constants = require('../vendor/d2s/lib/data/versions/105_constant_data').constants;
const names = ['Black Cleft', 'Bone Break', 'Cold Rupture', 'Crack of the Heavens', 'Flame Rift', 'Rotting Fissure'];
const simplify = name => name.replace(/[^a-z0-9]/gi, '').toLowerCase();
const item = name => ({ name, type: 'cm3', inSaves: { Sorc: [{ uniqueName: name }] } });

for (const grailWarlock of [false, true]) {
  const settings = { grailWarlock, grailType: GrailType.Both };
  const template = getHolyGrailSeedData(settings, false).uniques.other.charms.sunder;
  assert.deepStrictEqual(Object.keys(template).sort(), [...names].sort());
  for (const prefix of ['', 'Latent ', 'Renewed ']) {
    const found = {};
    for (const name of names) {
      const variant = prefix + name;
      assert(constants.unq_items.some(entry => entry?.n === variant), variant);
      assert.strictEqual(normalize(variant), simplify(name));
      found[normalize(variant)] = item(variant);
    }
    const stats = computeSubStats(found, {}, template, null, settings, null).normal;
    assert.strictEqual(stats.exists, 6);
    assert.strictEqual(stats.owned, 6);
    assert.strictEqual(stats.percent, 100);
  }
}

const oldItems = {
  coldrupture: item('Cold Rupture'),
  latentcoldrupture: item('Latent Cold Rupture'),
  renewedcoldrupture: item('Renewed Cold Rupture'),
  stoneofjordan: item('Stone of Jordan'),
};
const before = JSON.stringify(oldItems);
const merged = mergeSunderItems(oldItems);
assert.deepStrictEqual(Object.keys(merged).sort(), ['coldrupture', 'stoneofjordan']);
assert.strictEqual(merged.coldrupture.name, 'Cold Rupture');
assert.deepStrictEqual(merged.coldrupture.inSaves.Sorc.map(i => i.uniqueName), [
  'Cold Rupture', 'Latent Cold Rupture', 'Renewed Cold Rupture',
]);
assert.strictEqual(JSON.stringify(oldItems), before);
assert.deepStrictEqual(mergeSunderItems(merged), merged);
assert.strictEqual(merged.stoneofjordan, oldItems.stoneofjordan);
const template = getHolyGrailSeedData({ grailWarlock: true }, false).uniques.other.charms.sunder;
assert.strictEqual(computeSubStats(merged, {}, template, null, { grailType: GrailType.Both }, null).normal.owned, 1);

const history = { latentcoldrupture: true, coldrupture: false, renewedcoldrupture: false,
  renewedflamerift: true, 'latentbonebreak#eth': true, stoneofjordan: true };
const normalizedHistory = mergeSunderHistory(history);
assert.deepStrictEqual(normalizedHistory, { coldrupture: true, flamerift: true, 'bonebreak#eth': true, stoneofjordan: true });
assert.deepStrictEqual(mergeSunderHistory(normalizedHistory), normalizedHistory);
assert.strictEqual(history.coldrupture, false);
assert.strictEqual(normalize('Renewed Unrelated Item'), 'renewedunrelateditem');
assert.strictEqual(normalize('The Stone of Jordan'), 'stoneofjordan');
console.log('Sunder charm checks passed: six entries, all 18 variants, totals, manual data, and history.');
