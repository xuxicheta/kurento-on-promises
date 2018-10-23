#!/usr/bin/env node
//@ts-check
/**
 * Module dependencies.
 */
require('dotenv').config();
const debug = require('debug')('kurento-on-promises:server');
const https = require('https');
const path = require('path');
const fs = require('fs');

const { ConfigModule } = require('./modules/config.module');
const { WebSocketModule } = require('./modules/web-socket.module');
const { SessionPoolModule } = require('./modules/session-pool.class');
const { FilesModule } = require('./modules/files.module');
const { MediaModule } = require('./modules/media.module');
const config = new ConfigModule();
config.globalDirName = __dirname;

const hostname = config.get('hostname');
const certDir = path.join(__dirname, 'cert', hostname);

const httpsOptions = {
  key: fs.readFileSync(`${certDir}/privkey.pem`),
  cert: fs.readFileSync(`${certDir}/fullchain.pem`),
  ca: fs.readFileSync(`${certDir}/chain.pem`),
};

const app = require('./app');

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = https.createServer(httpsOptions, app);
const socket = new WebSocketModule(server); //eslint-disable-line
ConfigModule.assignWebSocket();

const sessionPool = new SessionPoolModule(); //eslint-disable-line
const files = new FilesModule(); //eslint-disable-line
MediaModule.assignWebSocket();

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const _port = parseInt(val, 10);

  if (Number.isNaN(_port)) {
    // named pipe
    return val;
  }

  if (_port >= 0) {
    // port number
    return _port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
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
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
}
