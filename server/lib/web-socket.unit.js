//@ts-check
/**
 * @typedef {object} MessageData
 * @property {string} method
 * @property {any} params
 * @property {number} id
 */

const WebSocket = require('ws');

const { Session } = require('./session.class');
const logger = require('../modules/logger/logger.module');
const log = logger.log;
const WS = logger.color.blue('WS');

class WebSocketUnit {
  constructor() {
    /** @type {WebSocket.Server} */
    this.wsServer = null;
    /** @type {Session[]} */
    this.sessions = [];
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
    const sessionId = req.url.slice(4);
    log(`${WS} connection with id "${sessionId}" from ip ${req.socket.remoteAddress}`);

    

    const session = new Session(sessionId);
    this.sessions.push(session);

    ws.on('message', (message) => {
      try {
        /** @type {MessageData} */
        const messageData = JSON.parse(message.toString());
        if (process.env.WS_LOG && messageData.method !== 'media/localCandidate') {
          if (messageData.method === 'media/sdpOffer') {
            log(logger.color.red('in'), messageData.method);
          } else {
            log(logger.color.red('in'), message);
          }
        }
        session.onMessageData(messageData);
      } catch (error) {
        logger.error(error);
      }
    });

    session.on('close', () => {
      this.sessions = this.sessions.filter(item => item !== session);
      if (ws.readyState !== ws.CLOSED) {
        ws.close();
      }
    });

    session.on('outcomeData', (data) => {
      const message = JSON.stringify(data);
      if (process.env.WS_LOG && data.method !== 'media/remoteCandidate') {
        if (data.method === 'media/sdpAnswer') {
          log(logger.color.blue('out'), data.method);
        } else {
          log(logger.color.blue('out'), message);
        }
      }
      ws.send(message);
    });


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

    ws.on('close', (code) => {
      logger.log(logger.color.red(`closed ${code}`));
      clearInterval(pingInterval);
      session.startDying();
    });
  });
  }

  findSessionById(sessionId) {
    return this.sessions.find(session => session.sessionId === sessionId);
  }
}


module.exports = new WebSocketUnit();
