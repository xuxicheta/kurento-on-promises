require('dotenv').config();
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
console.log(process.env.NODE_HOSTNAME);
const protocol = process.env.NODE_HOSTNAME === 'localhost' || !process.env.NODE_HOSTNAME
  ? 'http'
  : 'https';

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'public', 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [{
      test: /\.scss$/,
      use: [
        {
          loader: MiniCssExtractPlugin.loader,
          options: {},
        }, {
          loader: 'css-loader',
          options: {
            sourceMap: true,
          },
        }, {
          loader: 'sass-loader',
          options: {
            sourceMap: true,
          },
        },
      ],
    }],
  },
  plugins: [
    new OpenBrowserPlugin({ url: `${protocol}://${process.env.NODE_HOSTNAME}:${process.env.PORT}` }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
};
