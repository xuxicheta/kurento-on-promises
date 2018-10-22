const { socket } = require('./web-socket.module');
const { Session } = require('./session.class');

class SessionPool {
  constructor() {
    /** @type {Session[]} */
    this.pool = [];
  }

  /**
   *
   * @param {string} sessionId
   * @param {WS} ws
   */
  addSession(sessionId, ws) {
    const session = new Session(sessionId, ws);
    session.onremove = () => this.removeSession(sessionId);

    this.pool.push(session);
    return session;
  }

  findSession(sessionId) {
    return this.pool.find(session => session.sessionId === sessionId);
  }

  removeSession(sessionId) {
    // const session = this.findSession(sessionId);
    this.pool = this.pool.filter(session => session.sessionId !== sessionId);
    console.log('removed ', sessionId);
  }
}

const sessionPool = new SessionPool();

socket.addHandler('session/greetings', (data, ws, sessionId) => {
  /** @type {Session} */
  ws.session = sessionPool.addSession(sessionId, ws);
});

socket.addHandler('session/pong', (data, ws) => {
  ws.session.pong();
});
// console.log(socket);

module.exports.SessionPool = SessionPool;
module.exports.sessionPool = sessionPool;
