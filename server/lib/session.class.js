//@ts-check
const { MediaClass } = require('./media.class');

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
    /** @type {MediaClass} */
    this.media = null;
    /** @type {MediaClass} */
    this.player = null;

    this.onremove = () => undefined;
    this.socketTimeout = null;
  }

  /**
   * @param {string} offer
   */
  createMedia(offer) {
    this.media = new MediaClass(offer);
    this.media.onSend((type, data) => {
      this.sendData(type, data);
    });
    return this.media;
  }

  /**
   * @param {string} offer
   */
  createPlayer(offer) {
    this.player = new MediaClass(offer);
    this.player.onSend((type, data) => {
      this.sendData(type, data);
    });
    return this.player;
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
    clearTimeout(this.socketTimeout);
    console.log(`SESSION > resumed "${this.sessionId}"`);
    return this;
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
