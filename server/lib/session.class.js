//@ts-check
const socket = require('./web-socket.lib'); // eslint-disable-line

class Session {
  /**
   *
   * @param {string} sessionId
   * @param {WebSocket} ws
   */
  constructor(sessionId, ws) {
    this.createdAt = new Date();
    this.sessionId = sessionId;
    this.ws = ws;
    //@ts-ignore
    ws.session = this;
    this.onremove = () => undefined;
    this.socketTimeout = null;
  }

  onCloseSocket() {
    console.log(`SESSION ! breaks socket "${this.sessionId}" `);
    this.socketTimeout = setTimeout(() => {
      this.close();
    }, 10000);
  }

  /**
   * @param {WebSocket} ws
   */
  resume(ws) {
    this.ws = ws;
    //@ts-ignore
    ws.session = this;
    clearTimeout(this.socketTimeout);
    console.log(`SESSION > resumed "${this.sessionId}"`);
  }

  close() {
    console.log(`SESSION <<< "${this.sessionId}" closed`);
    this.onremove();
  }

  /**
   * @param {string} type
   * @param {*} data
   */
  sendData(type, data = '') {
    const str = JSON.stringify({
      type,
      data,
    });

    try {
      this.ws.send(str);
      return true;
    } catch (e) {
      //@ts-ignore
      console.error(`WS failed to send data, type "${type}"  session ${this.sessionId}`);
      return false;
    }
  }
}

module.exports = Session;
