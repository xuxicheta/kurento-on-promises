/** @type {string[]} */
let arr = [];
let all = false;
class Logger {
  constructor() {
    if (process.env.LOGGER) {
      arr = process.env.LOGGER.split(' ');
    }
    if (arr.includes('*') || process.env.LOGGER === '*') {
      all = true;
    }
  }

  /**
   * @param {string} id
   */
  getConsole(id) {
    return Logger.isEnabled(id)
      ? console.log
      : () => {};
  }

  static isEnabled(id) {
    return all || arr.includes(id);
  }
}

module.exports = new Logger();
