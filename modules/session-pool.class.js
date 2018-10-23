//@ts-check
const { socket, WebSocketModule } = require('./web-socket.module'); // eslint-disable-line
const { Session } = require('./session.class');

class SessionPoolModule {
  constructor() {
    /** @type {Session[]} */
    this.pool = [];
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
    // const session = this.findSession(sessionId);
    // session.close();
    this.pool = this.pool.filter(_session => _session.sessionId !== sessionId);
    console.log('removed ', sessionId);
  }
}

const sessionPool = new SessionPoolModule();

socket.addHandler('session/greetings', (data, ws, sessionId) => {
  /** @type {Session} */
  //@ts-ignore
  ws.session = sessionPool.addSession(sessionId, ws);
});

socket.addHandler('session/pong', (data, ws) => {
  //@ts-ignore
  ws.session.pong();
});
// console.log(socket);

module.exports.SessionPool = SessionPoolModule;
module.exports.sessionPool = sessionPool;
