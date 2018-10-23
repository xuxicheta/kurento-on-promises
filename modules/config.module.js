const { WebSocketModule } = require('./web-socket.module');

class ConfigModule {
  constructor() {
    if (ConfigModule._instance) {
      throw new Error('attempt to create singleton again');
    }
    this.data = {};
    this.globalDirName = '';
    this.data.wsUri = this.retrieveValue('wsUri', 'wss://vpsanton.ddns.net:8433/kurento');
    this.data.isAutoStart = this.retrieveValue('isAutoStart', true);
    this.data.isAutoRecord = this.retrieveValue('isAutoRecord', false);
    this.data.filePath = this.retrieveValue('filePath', '/files');
    this.data.hostname = this.retrieveValue('hostname', 'vpsanton.ddns.net', 'HOSTNAME');
    ConfigModule._instance = this;
  }

  /**
   *
   * @param {string} prop
   * @param {*} defaultValue
   */
  retrieveValue(prop, defaultValue, ENV_NAME = '') {
    return process.env[ENV_NAME] || defaultValue;
  }

  get(prop) {
    return this.data[prop];
  }

  static assignWebSocket() {
    const socket = WebSocketModule.instance;
    if (!ConfigModule['config/fetch']) {
      ConfigModule['config/fetch'] = socket.addHandler('config/fetch', (data, ws) => {
        const config = ConfigModule.instance;
        ws.sendData('config/all', config.data);
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
