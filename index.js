#!/usr/bin/env node
//@ts-check
/**
 * Module dependencies.
 */
require('dotenv').config();
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');

const log = require('./lib/log.class').getConsole('SERVER');
const config = require('./lib/config.lib');
config.setGlobal(__dirname);

const socket = require('./lib/web-socket.lib');
const sessionPool = require('./lib/session-pool.lib');
const files = require('./lib/files.lib');
const { MediaClass } = require('./lib/media.class');


const hostname = config.get('hostname');
const certDir = path.join(__dirname, 'cert', hostname);

const httpsOptions = fs.existsSync(certDir)
  ? {
    key: fs.readFileSync(`${certDir}/privkey.pem`),
    cert: fs.readFileSync(`${certDir}/fullchain.pem`),
    ca: fs.readFileSync(`${certDir}/chain.pem`),
  }
  : null;

const app = require('./app');

/**
 * Create HTTP server.
 */

const server = hostname === 'localhost'
  ? http.createServer(app)
  : https.createServer(httpsOptions, app);

server.listen(config.get('port'))
  .on('error', onError)
  .on('listening', onListening);
socket.create(server);
config.assignWebSocket();
sessionPool.assignWebSocket();
files.assignWebSocket();
MediaClass.assignWebSocket();

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const port = config.get('port');
  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`SERVER ${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`SERVER ${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const protocol = hostname === 'localhost' ? 'http' : 'https';
  log(`SERVER Listening on ${protocol}://${hostname}:${config.get('port')}`);
}
