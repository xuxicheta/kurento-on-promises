//@ts-check

require('dotenv').config();
const https = require('https');
const http = require('http');

const log = require('./lib/log.class').getConsole('SERVER');
const { MediaClass } = require('./lib/media.class');

/****  init app  ****/
const config = require('./lib/config.lib');
config.setGlobal(`${__dirname}/..`);

const socket = require('./lib/web-socket.lib');
const sessionPool = require('./lib/session-pool.lib');
const files = require('./lib/files.lib');

const app = require('./app');

/**
 * Create HTTP server.
 */

const server = http.createServer(app);
const serverSSL = https.createServer(files.readCertificates(), app);

serverSSL.listen(config.get('httpsPort'))
  .on('error', onError)
  .on('listening', () => {
      log(`SERVER listening on https://${config.get('nodeHostname')}:${config.get('httpsPort')}`);
  });
socket.create(serverSSL);
config.assignWebSocket();
sessionPool.assignWebSocket();
files.assignWebSocket();
MediaClass.assignWebSocket();

server.listen(config.get('httpPort'))
  .on('error', onError)
  .on('listening', () => {
    log(`SERVER listening on http://${config.get('nodeHostname')}:${config.get('httpPort')}`);
});

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

process.on('beforeExit', () => {
  socket.wsServer.clients.forEach(ws => ws.close());
});
