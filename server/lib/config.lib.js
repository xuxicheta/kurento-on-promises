//@ts-check
const dns = require('dns');
const path = require('path');
const socket = require('./web-socket.lib');


class ConfigLib {
  constructor() {
    this.globalDirName = '';
    /**
     * @private
     */
    this._data = {
      filesPath: process.env.FILES_PATH,
      httpPort: process.env.HTTP_PORT,
      httpsPort: process.env.HTTPS_PORT,
      kurentoFilesPath: process.env.KURENTO_FILES_PATH,
      kurentoWsUri: process.env.KURENTO_WS_URI,
      nodeHostname: process.env.NODE_HOSTNAME,
      nodeIp: process.env.NODE_IP,
      recordEndpoint: process.env.RECORD_ENDPOINT,
      // recordHostname: process.env.RECORD_HOSTNAME,
      // recordIp: process.env.RECORD_IP,
      // recordPort: process.env.RECORD_PORT,
      recordHostname: process.env.NODE_HOSTNAME,
      recordIp: process.env.NODE_IP,
      recordPort: process.env.HTTP_PORT,
    };

    if (!this._data.recordIp && this._data.recordHostname) {
      dns.resolve4(this._data.recordHostname, (err, addrs) => {
        if (err) {
          console.error('CONFIG dsn resolve error on hostname', this._data.hostname);
        }
        this.set('recordIp', addrs[0]);
      });
    }

  }

  /**
   * @param {string} prop
   */
  get(prop) {
    return this._data[prop];
  }

  set(prop, value) {
    this._data[prop] = value;
  }

  setGlobal(dir) {
    this.globalDirName = path.resolve(dir);
    this._data.filesFullPath = path.resolve(this.globalDirName, this._data.filesPath);
  }

  assignWebSocket() {
    socket.setHandler('config/fetch', (data, ws) => {
      ws.sendData('config/all', this._data);
    });
  }

}

module.exports = new ConfigLib();
