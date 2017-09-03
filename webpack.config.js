const webpack = require('webpack');
const path = require('path');
const rootPath = path.resolve(__dirname, './');

const cfg = {
  context: path.resolve(__dirname, './src'),

  entry: './index.ts',

  resolve: {
    modules: [rootPath, 'node_modules'],
    extensions: ['.js', '.ts', '.tsx']
  },


  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      }
    ]
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'hotkeys.js',
    libraryTarget: 'umd',
    library: 'HotKeys'
  },

  plugins: [
    new webpack.NoEmitOnErrorsPlugin()
  ]
};

if (process.env.NODE_ENV.toString() === 'production') {
  console.log('\nBuilding production bundle...\n');
  cfg.output.filename = 'hotkeys.min.js';
} else {
  console.log('\nBuilding development bundle...\n');
}

module.exports = cfg;