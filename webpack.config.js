require('dotenv').config();
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const path = require('path');
console.log(process.env.NODE_HOSTNAME);

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new OpenBrowserPlugin({ url: `https://${process.env.NODE_HOSTNAME}:${process.env.PORT}` }),
  ],
};
