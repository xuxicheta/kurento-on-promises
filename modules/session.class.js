//@ts-check
const { WebSocketModule } = require('./web-socket.module'); // eslint-disable-line

const TIMEOUT = 20000;
const EXPIRE_TIMEOUT = TIMEOUT * 4;

// console.log(media);


class Session {
  /**
   *
   * @param {string} sessionId
   * @param {WebSocketModule} ws
   */
  constructor(sessionId, ws) {
    this.createdAt = new Date();
    this.sessionId = sessionId;
    this.ws = ws;
    /** @type {NodeJS.Timeout} */
    this.pingTimeout = null;
    /** @type {NodeJS.Timeout} */
    this.expirationTimeout = null;
    this.expired = null;
    this.onremove = () => undefined;
    this.pong();
  }

  pong() {
    clearTimeout(this.pingTimeout);
    clearTimeout(this.expirationTimeout);
    this.pingTimeout = setTimeout(() => this.ping(), TIMEOUT);
    this.expirationTimeout = setTimeout(() => this.expire(), EXPIRE_TIMEOUT);
  }

  ping() {
    const alive = this.ws.sendData('ping', '');
    if (!alive) {

      this.close();
    }
    // if (!this.expired) {
    //   this.pingTimeout = setTimeout(() => this.ping(), TIMEOUT);
    // }
  }

  expire() {
    // this.expired = new Date();
    // this.close();
    // console.log('expired', this);
  }

  close() {
    clearTimeout(this.pingTimeout);
    clearTimeout(this.expirationTimeout);
    this.onremove();
  }
}

module.exports = Session;
