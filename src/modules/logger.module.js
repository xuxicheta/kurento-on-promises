export const logger = {
  getColoringStringFabric() {
    const colors = {
      black: str => `\x1b[30m${str}\x1b[0m`,
      red: str => `\x1b[31m${str}\x1b[0m`,
      green: str => `\x1b[32m${str}\x1b[0m`,
      yellow: str => `\x1b[33m${str}\x1b[0m`,
      blue: str => `\x1b[34m${str}\x1b[0m`,
      magenta: str => `\x1b[35m${str}\x1b[0m`,
      cyan: str => `\x1b[36m${str}\x1b[0m`,
      white: str => `\x1b[37m${str}\x1b[0m`,
    };
    const noColors = {
      black: str => str,
      red: str => str,
      green: str => str,
      yellow: str => str,
      blue: str => str,
      magenta: str => str,
      cyan: str => str,
      white: str => str,
    };
    return process.env.COLORED_LOG ? colors : noColors;
  },

  get color() {
    return this.getColoringStringFabric();
  },

  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
};
