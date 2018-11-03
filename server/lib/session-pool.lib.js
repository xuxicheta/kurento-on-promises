//@ts-check
const Session = require('./session.class');
const socket = require('./web-socket.lib'); // eslint-disable-line

class SessionPoolModule {
  constructor() {
    /** @type {Session[]} */
    this.pool = [];
  }

  /**
   *
   * @param {string} sessionId
   * @param {socket} ws
   * @returns {Session}
   */
  addSession(sessionId, ws) {
    const session = new Session(sessionId, ws);
    session.onremove = () => {
      this.removeSession(sessionId);
    };

    this.pool.push(session);
    console.log(`SESSION created ${sessionId}`);

    return session;
  }

  /**
   * @param {string} sessionId
   * @returns {Session}
   */
  findSession(sessionId) {
    return this.pool.find(session => session.sessionId === sessionId);
  }

  /**
   * @param {string} sessionId
   */
  removeSession(sessionId) {
    this.pool = this.pool.filter(_session => _session.sessionId !== sessionId);
    console.log(`SESSION removed ${sessionId}`);
  }

  assignWebSocket() {
    socket
      .setHandler('session/greetings', (data, ws, sessionId) => {
        /** @type {Session} */
        //@ts-ignore
        ws.session = this.addSession(sessionId, ws);
      })
      .setHandler('session/pong', (data, ws) => {
        //@ts-ignore
        ws.session.pong();
      });
  }
}

module.exports = new SessionPoolModule();
