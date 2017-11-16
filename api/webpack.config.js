const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, './main.js'),
  output: {
    filename: 'api.min.js',
    path: path.resolve(__dirname, '../app/public/'),
    library: 'api',
    libraryTarget: 'umd',
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      options: {
        presets: [ 'env' ],
      },
    }],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
  ],
};
