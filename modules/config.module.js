const { socket } = require('./web-socket.module');

class Config {
  constructor() {
    this.data = {};
    this.data.wsUri = this.retrieveValue('wsUri', 'wss://vpsanton.ddns.net:8433/kurento');
    this.data.isAutoStart = this.retrieveValue('isAutoStart', true);
    this.data.isAutoRecord = this.retrieveValue('isAutoRecord', false);
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
}

const config = new Config();

socket.addHandler('config/fetch', (data, ws) => {
  const str = JSON.stringify({
    type: 'config/all',
    data: Object.assign({}, config.data),
  });
  ws.send(str);
});

module.exports.config = config;
