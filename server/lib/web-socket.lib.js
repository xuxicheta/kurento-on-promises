//@ts-check
const WebSocket = require('ws');
const Session = require('./session.class');  // eslint-disable-line
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

    this.wsServer.on('connection', (ws) => {
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

      //@ts-ignore
      ws.sendData = (type, data) => {
        const str = JSON.stringify({
          type,
          data,
        });

        try {
          ws.send(str);
          return true;
        } catch (e) {
          //@ts-ignore
          console.error(`WS failed to send data, type "${type}"  session ${ws.session.sessionId}`);
          return false;
        }
      };

      ws.on('close', () => {
        clearInterval(pingInterval);
        /** @type {Session} */
        //@ts-ignore
        const session = ws.session;
        if (session) {
          session.onCloseSocket();
        }
      });

      ws.on('message', (message) => {
        try {
          const { type, data, sessionId } = JSON.parse(message.toString());

          if (!Array.isArray(messageHandlers[type])) {
            const error = new DetailedError('unrecognized incoming socket');
            error.details = { type, data, sessionId };
            throw error;
          }

          messageHandlers[type].forEach((handler) => {
            handler(data, ws, sessionId);
          });
        } catch (error) {
          console.error(error);
        }
      });
    });
  }

  /**
   * @callback wsHandlerCallback
   * @param {*} data
   * @param {WebSocket} ws
   * @param {string} sessionId
   */

  /**
   * @param {string} prop
   * @param {wsHandlerCallback} handler
   * @returns {WebSocketModule}
   */
  addHandler(prop, handler) {
    if (!Array.isArray(this.handlers[prop])) {
      this.handlers[prop] = [];
    }
    this.handlers[prop].push(handler.bind(this));
    return this;
  }

  setHandler(prop, handler) {
    this.handlers[prop] = [handler.bind(this)];
    return this;
  }
}


module.exports = new WebSocketModule();
