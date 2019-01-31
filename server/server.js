//@ts-check

require('dotenv').config();
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');

const logger = require('./modules/logger/logger.module');
const webSocketUnit = require('./lib/web-socket.unit');

const log = logger.log;
const SERVER = logger.color.green('SERVER');

/****  init app  ****/
const { config } = require('./config');
config.setRootDir(`${__dirname}/..`);

const app = require('./app');

/**
 * Create HTTP servers.
 */
const certDir = path.resolve(config.globalDirName, 'cert', config.get('nodeHostname'));
const certs = {
  key: fs.readFileSync(`${certDir}/privkey.pem`).toString(),
  cert: fs.readFileSync(`${certDir}/fullchain.pem`).toString(),
  ca: fs.readFileSync(`${certDir}/chain.pem`).toString(),
};

const httpServer = http.createServer(app);
const httpsServer = https.createServer(certs, app);

httpsServer.listen(config.get('httpsPort'))
  .on('error', onError)
  .on('listening', () => {
      log(`${SERVER} listening on https://${config.get('nodeHostname')}:${config.get('httpsPort')}`);
  });

webSocketUnit.create(httpsServer);

httpServer.listen(config.get('httpPort'))
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

process.on('beforeExit', () => {
  webSocketUnit.wsServer.clients.forEach(ws => ws.close());
});
