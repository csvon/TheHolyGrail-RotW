// Run with: node scripts/test-item-name-normalization.cjs
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
const { normalizeParsedUniqueOrSetDisplayName: displayName } = require('../electron/lib/itemNameNormalization.ts');
for (const piece of ['Paragon', 'Riprap', 'Superstition', 'Taboo']) {
  for (const prefix of ["Mc Auley's", "McAuley's"]) {
    assert.strictEqual(normalize(`${prefix} ${piece}`), `sanders${piece.toLowerCase()}`);
    assert.strictEqual(displayName(`${prefix} ${piece}`), `Sander's ${piece}`);
  }
  assert.strictEqual(displayName(`Sander's ${piece}`), `Sander's ${piece}`);
}
console.log('Item name normalization checks passed: all four Sander pieces and both legacy spellings.');
