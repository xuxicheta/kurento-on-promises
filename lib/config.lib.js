//@ts-check
const socket = require('./web-socket.lib');

class ConfigLib {
  constructor() {
    this.globalDirName = '';
    /**
     * @private
     */
    this._data = {
      wsUri: process.env.KURENTO_WS_URI || 'wss://vpsanton.ddns.net:8433/kurento',
      filePath: process.env.FILE_PATH || '/files',
      hostname: process.env.NODE_HOSTNAME || 'vpsanton.ddns.net',
      port: process.env.PORT || 3000,
    };
  }

  /**
   * @param {string} prop
   */
  get(prop) {
    return this._data[prop];
  }

  setGlobal(dir) {
    this.globalDirName = dir;
  }

  assignWebSocket() {
    socket.setHandler('config/fetch', (data, ws) => {
      ws.sendData('config/all', this._data);
    });
  }

}

module.exports = new ConfigLib();
