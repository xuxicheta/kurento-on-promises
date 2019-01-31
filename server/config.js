//@ts-check
const dns = require('dns');
const path = require('path');

const config = {
  rootDir: path.resolve(__dirname),
  filesPath: process.env.FILES_PATH,

  httpPort: process.env.HTTP_PORT,
  httpsPort: process.env.HTTPS_PORT,

  kurentoFilesPath: process.env.KURENTO_FILES_PATH,
  kurentoWsUri: process.env.KURENTO_WS_URI,

  nodeHostname: process.env.NODE_HOSTNAME,
  nodeIp: process.env.NODE_IP,

  recordEndpoint: process.env.RECORD_ENDPOINT,
};


dns.resolve4(config.nodeHostname, (err, addresses) => {
  if (err) {
    console.error('CONFIG dsn resolve error on hostname', this._data.hostname);
  }
  this.set('recordIp', addresses[0]);
});
module.exports.config = config;
