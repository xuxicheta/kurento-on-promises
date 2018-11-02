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
      wsUri: process.env.KURENTO_WS_URI || 'wss://vpsanton.ddns.net:8433/kurento',
      filesPath: process.env.FILES_PATH || '/files',
      recordIp: process.env.RECORD_IP,
      recordHostname: process.env.RECORD_HOSTNAME || 'antshvets.ddns.net',
      recordPath: process.env.RECORD_PATH || 'record',
      recordPort: process.env.RECORD_PORT || 3000,
      recordProtocol: process.env.RECORD_PROTOCOL || 'https',
      hostname: process.env.NODE_HOSTNAME || 'antshvets.ddns.net',
      port: process.env.PORT || 3000,
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
    this.globalDirName = dir;
    this._data.filesFullPath = path.resolve(this.globalDirName, this._data.filesPath);
  }

  assignWebSocket() {
    socket.setHandler('config/fetch', (data, ws) => {
      ws.sendData('config/all', this._data);
    });
  }

}

module.exports = new ConfigLib();
