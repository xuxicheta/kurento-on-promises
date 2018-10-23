const { WebSocketModule } = require('./web-socket.module');

class ConfigModule {
  constructor() {
    if (ConfigModule._instance) {
      throw new Error('attempt to create singleton again');
    }
    this.globalDirName = '';
    this._data = {
      wsUri: process.env.KURENTO_WS_URI || 'wss://vpsanton.ddns.net:8433/kurento',
      filePath: process.env.FILE_PATH || '/files',
      hostname: process.env.NODE_HOSTNAME || 'vpsanton.ddns.net',
    };
    ConfigModule._instance = this;
  }

  /**
   * @param {string} prop
   */
  get(prop) {
    return this._data[prop];
  }

  static assignWebSocket() {
    const socket = WebSocketModule.instance;
    if (!ConfigModule['config/fetch']) {
      ConfigModule['config/fetch'] = socket.addHandler('config/fetch', (data, ws) => {
        const config = ConfigModule.instance;
        ws.sendData('config/all', config._data);
      });
    }
  }

  /**
   * @returns {ConfigModule}
   */
  static get instance() {
    return ConfigModule._instance;
  }
}

module.exports = {
  ConfigModule,
};
