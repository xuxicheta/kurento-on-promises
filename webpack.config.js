

const path = require('path');
// const webpack = require('webpack');

// const ExtractTextPlugin = require('extract-text-webpack-plugin');

// const plugins = [
//   new ExtractTextPlugin('[name].css'),
//   new webpack.ProvidePlugin({
//     kurentoClient: path.join(__dirname, 'public', 'js/kurento-client.js'),
//     // jQuery: path.join(__dirname, 'node_modules', 'jquery/dist/jquery'),
//   }),
// ];

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
};
