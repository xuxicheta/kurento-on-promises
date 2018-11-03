require('dotenv').config();
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
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
  plugins: [
    new OpenBrowserPlugin({ url: `${protocol}://${process.env.NODE_HOSTNAME}:${process.env.PORT}` }),
  ],
};
