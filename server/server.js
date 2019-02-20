//@ts-check

require('dotenv').config();
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');

const logger = require('./modules/logger/logger.module');
const webSocketUnit = require('./lib/web-socket.unit');
const { config } = require('./config');

const log = logger.log;
const SERVER = logger.color.grey('SERVER');

/****  init app  ****/
const app = require('./app');

/**
 * Create HTTP servers.
 */
const certificatesDirectory = path.join(__dirname, 'cert', config.hostname);
const certs = {
  key: fs.readFileSync(`${certificatesDirectory}/privkey.pem`).toString(),
  cert: fs.readFileSync(`${certificatesDirectory}/fullchain.pem`).toString(),
  ca: fs.readFileSync(`${certificatesDirectory}/chain.pem`).toString(),
};

const httpServer = http.createServer(app);
const httpsServer = https.createServer(certs, app);

httpsServer.listen(config.httpsPort)
  .on('error', onError)
  .on('listening', () => {
      log(`${SERVER} listening on https://${config.hostname}:${config.httpsPort}`);
  });

webSocketUnit.create(httpsServer);

httpServer.listen(config.httpPort)
  .on('error', onError)
  .on('listening', () => {
    log(`${SERVER} listening on http://${config.hostname}:${config.httpPort}`);
});

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const port = config.httpPort;
  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(`SERVER ${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`SERVER ${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

module.exports = {
  httpServer,
  httpsServer,
};
