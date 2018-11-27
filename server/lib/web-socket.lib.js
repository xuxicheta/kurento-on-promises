//@ts-check
const WebSocket = require('ws');
const sessionPool = require('./session-pool.lib');
const { DetailedError } = require('./error.lib');

class WebSocketModule {
  constructor() {
    /** @type {WebSocket.Server} */
    this.wsServer = null;
    /** @type {WebSocket[]} */
    this.clients = [];
    this.handlers = {};

    /**
     * @param {string} type
     * @param {*} data
     */
    this.sendData = (type, data) => undefined; // eslint-disable-line
  }

  create(server) {
    this.wsServer = new WebSocket.Server({
      server,
      path: '/ws',
    });

    this.wsServer.on('connection', (ws, req) => {
      const sessionId = req.url.slice(4);
      //@ts-ignore
      const session = sessionPool.onNewConnection(sessionId, ws);
      let isAlive = true;
      const messageHandlers = this.handlers;
      this.clients.push(ws);

      const pingInterval = setInterval(() => {
        try {
          if (!isAlive) {
            ws.terminate();
          }

          ws.ping();
        } catch (e) {
          console.warn('WS cant ping');
        }
        isAlive = false;
      }, 5000);

      ws.on('pong', () => {
        isAlive = true;
      });

      ws.on('close', () => {
        clearInterval(pingInterval);
        if (session) {
          session.onCloseSocket();
        }
      });

      ws.on('message', (message) => {
        try {
          const { type, data } = JSON.parse(message.toString());

          if (!Array.isArray(messageHandlers[type])) {
            const error = new DetailedError('unrecognized incoming socket');
            error.details = { type, data, sessionId };
            throw error;
          }

          messageHandlers[type].forEach((handler) => {
            handler(session, data);
          });
        } catch (error) {
          console.error(error);
        }
      });
    });
  }

  /**
   * @callback wsHandlerCallback
   * @param {Session} session
   * @param {*?} data
   */

  /**
   * @param {string} prop
   * @param {wsHandlerCallback} handler
   * @returns {WebSocketModule}
   */
  addHandler(prop, handler) {
    if (Array.isArray(this.handlers[prop])) {
      this.handlers[prop].push(handler.bind(this));
    } else {
      this.handlers[prop] = [handler.bind(this)];
    }
    return this;
  }

  /**
   * @param {string} prop
   * @param {wsHandlerCallback} handler
   * @returns {WebSocketModule}
   */
  setHandler(prop, handler) {
    this.handlers[prop] = [handler.bind(this)];
    return this;
  }
}


module.exports = new WebSocketModule();
