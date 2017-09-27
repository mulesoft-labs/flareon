const webpack = require('webpack');
const path = require('path');
const rootPath = path.resolve(__dirname, './');

const cfg = {
  context: path.resolve(__dirname, './src'),

  entry: './index.ts',

  entry: {
    "flareon": "./index.ts",
    "flareon.min": "./index.ts",
  },

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
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'Flareon'
  },

  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true
    })
  ]
};


module.exports = cfg;