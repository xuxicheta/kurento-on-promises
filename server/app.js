//@ts-check
const httpErrors = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const { router } = require('./routes/index.route');
const config = require('./lib/config.lib');

const app = express();

// app.use((req, res, next) => {
//   console.log(req.url);
//   next();
// });

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.resolve(config.globalDirName, 'public', 'static')));
app.use(express.static(path.resolve(config.globalDirName, 'public', 'dist')));
app.use(express.static(path.resolve(config.globalDirName, 'files')));
app.use(router);
app.get('favicon.ico', (req, res) => {
  res.send('');
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(httpErrors(404));
});

// error handler
app.use((err, req, res, next) => {  // eslint-disable-line
  console.error('error route', req.url);
  res.status(404).json({});
});

module.exports = app;
