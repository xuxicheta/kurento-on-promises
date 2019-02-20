export const logger = {
  getColoringStringFabric() {
    const colors = {
      black: (str: string) => `\x1b[30m${str}\x1b[0m`,
      red: (str: string) => `\x1b[31m${str}\x1b[0m`,
      green: (str: string) => `\x1b[32m${str}\x1b[0m`,
      yellow: (str: string) => `\x1b[33m${str}\x1b[0m`,
      blue: (str: string) => `\x1b[34m${str}\x1b[0m`,
      magenta: (str: string) => `\x1b[35m${str}\x1b[0m`,
      cyan: (str: string) => `\x1b[36m${str}\x1b[0m`,
      white: (str: string) => `\x1b[37m${str}\x1b[0m`,
    };
    const noColors = {
      black: (str: string) => str,
      red: (str: string) => str,
      green: (str: string) => str,
      yellow: (str: string) => str,
      blue: (str: string) => str,
      magenta: (str: string) => str,
      cyan: (str: string) => str,
      white: (str: string) => str,
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
