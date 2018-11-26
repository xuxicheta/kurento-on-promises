//@ts-check
const { cyan } = require('chalk').default;
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
   * @param {WebSocket} ws
   * @returns {Session}
   */
  addSession(sessionId, ws) {
    const session = new Session(sessionId, ws);
    session.onremove = () => {
      this.removeSession(sessionId);
    };

    this.pool.push(session);
    console.log(`SESSION ${cyan('>>>')} created "${sessionId}"`);
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
  }

  assignWebSocket() {
    socket
      .setHandler('session/greetings', (data, ws, sessionId) => {
        const foundedSession = this.findSession(sessionId);
        if (foundedSession) {
          foundedSession.resume(ws);
          return;
        }
        this.addSession(sessionId, ws);
      });
  }
}

module.exports = new SessionPoolModule();
