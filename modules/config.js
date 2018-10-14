class Config {
  constructor() {
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
  retrieveValue(prop, defaultValue) {
    const attempt = this.getItem(prop);
    if (attempt === undefined) {
      return defaultValue;
    }
    return attempt;
  }
}

module.exports.Config = Config;
