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
      wsUri: process.env.KURENTO_WS_URI,
      filesPath: process.env.FILES_PATH,
      kurentoFilesPath: process.env.KURENTO_FILES_PATH,
      recordIp: process.env.RECORD_IP,
      recordHostname: process.env.RECORD_HOSTNAME,
      recordEndpoint: process.env.RECORD_ENDPOINT,
      recordPort: process.env.RECORD_PORT,
      recordProtocol: process.env.RECORD_PROTOCOL,
      hostname: process.env.NODE_HOSTNAME,
      port: process.env.PORT,
      protocol: process.env.NODE_PROTOCOL,
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
