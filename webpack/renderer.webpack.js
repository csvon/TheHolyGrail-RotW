const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = async () => ({
  mode: 'development',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.d.ts']
  },
  module: {
    rules: require('./rules.webpack'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { context: "./public/fonts", from: "*.woff2", to: "./stream" },
        { context: "./public/fonts", from: "*.ttf", to: "./stream" },
        { from: "assets", to: "assets" }, // Copy assets to renderer build too
      ],
    }),
  ],
});