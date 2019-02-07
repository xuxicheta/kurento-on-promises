//@ts-check
const httpErrors = require('http-errors');
const express = require('express');
const path = require('path');
const morgan = require('morgan');

const { router } = require('./routes/index.route');
const { config } = require('./config');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.resolve(config.rootDir, 'client', 'static')));
app.use(express.static(path.resolve(config.rootDir, 'client', 'dist')));
app.use(express.static(path.resolve(config.rootDir, 'files')));
app.use(router);
app.get('favicon.ico', (req, res) => {
  res.send('');
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(httpErrors(404));
});

module.exports = app;
