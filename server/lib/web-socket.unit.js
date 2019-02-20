//@ts-check

const WebSocket = require('ws');

const { Session } = require('./session.class');
const logger = require('../modules/logger/logger.module');
const log = logger.log;
const WS = logger.color.yellow('WS');

class WebSocketUnit {
  constructor() {
    /** @type {WebSocket.Server} */
    this.wsServer = null;
    /** @type {Session[]} */
    this.sessions = [];
    this.connectionCounter = 0;
  }

  create(server) {
    this.wsServer = new WebSocket.Server({
      server,
      path: '/ws',
    });

    process.on('SIGINT', () => {
      this.wsServer.clients.forEach((client) => {
        client.send(JSON.stringify({
          method: 'reload',
        }));
        client.close();
      });
      process.exit();
    });


    this.wsServer.on('connection', (ws, req) => {
      const number = this.connectionCounter++;
      const sessionId = req.url.slice(4);
      log(`${WS} ${logger.color.green('new')} connection "${number}~${sessionId}" from ip ${req.socket.remoteAddress}`);
      let session = this.findSessionById(sessionId);
      if (!session) {
        session = new Session(sessionId);
        this.sessions.push(session);
        session.on('close', () => {
          this.sessions = this.sessions.filter(item => item !== session);
          log(`${WS} total sessions remained ${this.sessions.length}`);
        });
      }
      session.adsorbConnection(ws);
      const pingInterval = this.heartBeat(ws);
      ws.on('close', (code) => {
        logger.log(`${WS} ${logger.color.red('closed')} connection "${number}~${sessionId}" with code "${code}"`);
        clearInterval(pingInterval);
      });
    });
  }

  /**
   * @param {import('ws')} ws
   * @returns {NodeJS.Timeout}
   */
  heartBeat(ws) {
    let isAlive = true;
    const pingInterval = setInterval(() => {
      try {
        if (!isAlive) {
          ws.close();
        }

        ws.ping();
      } catch (e) {
        logger.warn('WS cant ping');
      }
      isAlive = false;
    }, 5000);

    ws.on('pong', () => {
      isAlive = true;
    });
    return pingInterval;
  }

  findSessionById(sessionId) {
    return this.sessions.find(session => session.sessionId === sessionId);
  }
}


module.exports = new WebSocketUnit();
