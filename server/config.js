//@ts-check
const dns = require('dns');
const path = require('path');

const config = {
  rootDir: path.resolve(__dirname, '..'),
  filesPath: process.env.FILES_PATH,

  httpPort: process.env.HTTP_PORT,
  httpsPort: process.env.HTTPS_PORT,

  kurentoFilesPath: process.env.KURENTO_FILES_PATH,
  kurentoWsUri: process.env.KURENTO_WS_URI,

  hostname: process.env.NODE_HOSTNAME,
  ip: process.env.NODE_IP,

  iceServers: process.env.ICE_SERVERS || [],

  recordEndpoint: process.env.RECORD_ENDPOINT,
};


dns.resolve4(config.hostname, (err, addresses) => {
  if (err) {
    console.error('CONFIG dsn resolve error on hostname', config.hostname);
  }
  config.ip = addresses[0];
});

module.exports.config = config;
