const CopyPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
  resolve: {
    // Use the maintained parser even when Yarn's file dependency copy is stale.
    alias: { '@dschu012/d2s': path.resolve(__dirname, '../vendor/d2s') },
    extensions: ['.ts', '.js', '.d.ts']
  },
  entry: './electron/main.ts',
  module: {
    rules: require('./rules.webpack'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "bin/*.jar", to: "." },
        { from: "assets", to: "assets" }, // Copy entire assets folder
      ],
    }),
  ],
}
