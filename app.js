//@ts-check
const httpErrors = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const { router } = require('./routes/index.route');

const app = express();

// view engine setup

// app.use((req, res, next) => {
//   console.log(req.url);
//   next();
// });

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'files')));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(router);

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
