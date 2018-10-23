//@ts-check
const Session = require('./session.class');
const { WebSocketModule } = require('./web-socket.module'); // eslint-disable-line

class SessionPoolModule {
  constructor() {
    if (SessionPoolModule._instance) {
      throw new Error('attempt to create singleton again');
    }
    /** @type {Session[]} */
    this.pool = [];
    SessionPoolModule._instance = this;
    SessionPoolModule.assignWebSocket();
  }

  /**
   *
   * @param {string} sessionId
   * @param {WebSocketModule} ws
   */
  addSession(sessionId, ws) {
    const session = new Session(sessionId, ws);
    session.onremove = () => {
      this.removeSession(sessionId);
    };

    this.pool.push(session);
    return session;
  }

  findSession(sessionId) {
    return this.pool.find(session => session.sessionId === sessionId);
  }

  removeSession(sessionId) {
    this.pool = this.pool.filter(_session => _session.sessionId !== sessionId);
    console.log('removed ', sessionId);
  }

  static assignWebSocket() {
    const socket = WebSocketModule.instance;
    if (!SessionPoolModule['session/greetings']) {
      SessionPoolModule['session/greetings'] = socket.addHandler('session/greetings', (data, ws, sessionId) => {
        /** @type {Session} */
        //@ts-ignore
        ws.session = SessionPoolModule._instance.addSession(sessionId, ws);
      });
    }

    if (!SessionPoolModule['session/pong']) {
      SessionPoolModule['session/pong'] = socket.addHandler('session/pong', (data, ws) => {
        //@ts-ignore
        ws.session.pong();
      });
    }
  }

  /**
   * @returns {SessionPoolModule}
   */
  static get instance() {
    return SessionPoolModule._instance;
  }
}

SessionPoolModule._instance = null;

module.exports = { SessionPoolModule };
