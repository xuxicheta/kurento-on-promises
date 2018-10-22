
const TIMEOUT = 20000;
const EXPIRE_TIMEOUT = TIMEOUT * 4;

// console.log(media);


class Session {
  /**
   *
   * @param {string} sessionId
   * @param {WS} ws
   */
  constructor(sessionId, ws) {
    this.createdAt = new Date();
    this.sessionId = sessionId;
    this.ws = ws;
    this.pingTimeout = 0;
    this.expirationTimeout = 0;
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
    const str = JSON.stringify({
      type: 'ping',
      data: '',
    });
    this.ws.send(str);
    if (!this.expired) {
      this.pingTimeout = setTimeout(() => this.ping(), TIMEOUT);
    }
  }

  expire() {
    // this.expired = new Date();
    // this.close();
    // console.log('expired', this);
  }

  close() {
    this.onremove();
  }
}

module.exports.Session = Session;
