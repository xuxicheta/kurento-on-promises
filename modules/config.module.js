const { socket } = require('./web-socket.module');

class Config {
  constructor() {
    console.log('config module constructor');
    
    // 'ws://antshvets.ddns.net:8888/kurento'
    this.localStoragePrefix = 'kurento_config';
    this.wsUri = this.retrieveValue('wsUri', 'ws://vpsanton.ddns.net:8888/kurento');
    this.isAutoStart = this.retrieveValue('isAutoStart', true);
    this.isAutoRecord = this.retrieveValue('isAutoRecord', false);
  }

  // DOMhandle() {
  //   this.configSection = document.getElementById('config');
  //   this.div_wsUri = this.configSection.querySelector('#wsUri');
  //   this.div_wsUri.textContent = this.wsUri;
  // }

  /**
   *
   * @param {string} prop
   */
  getItem(prop) {
    try {
      const value = localStorage.getItem(`${this.localStoragePrefix}/${prop}`);
      return JSON.parse(value);
    } catch (e) {
      return undefined;
    }
  }

  /**
   *
   * @param {string} prop
   * @param {*} value
   */
  setItem(prop, value) {
    const str = JSON.stringify(value);
    localStorage.setItem(`${this.localStoragePrefix}/${prop}`, str);
  }

  /**
   *
   * @param {string} prop
   * @param {*} defaultValue
   */
  retrieveValue(prop, defaultValue, ENV_NAME = '') {
    const attempt = this.getItem(prop);
    if (attempt === undefined) {
      return process.env[ENV_NAME] || defaultValue;
    }
    return attempt;
  }
}

const config = new Config();

socket.addHandler('config/fetch', (data, _socket) => {
  const str = JSON.stringify({
    type: 'config/all',
    data: Object.assign({}, config),
  });
  _socket.send(str);
});

module.exports.config = config;
