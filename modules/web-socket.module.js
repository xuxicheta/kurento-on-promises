const WebSocket = require('ws');

const DEFAULT_WS_PORT = 3001;
const WS_PORT = process.env.WS_PORT || DEFAULT_WS_PORT;

class WS {
  constructor() {
    this.wsServer = new WebSocket.Server({
      port: WS_PORT,
    });
    this.clients = [];
    this.handlers = {};

    this.wsServer.on('connection', (ws) => {
      const _this = this;
      this.clients.push(ws);

      ws.onclose = () => {
        this.clients = this.clients.filter(client => client !== ws);
      };

      ws.on('message', (message) => {
        try {
          const { type, data, sessionId } = JSON.parse(message);

          if (!Array.isArray(_this.handlers[type])) {
            const error = new Error('unrecognized incoming socket');
            error.details = { type, data, sessionId };
            throw error;
          }

          _this.handlers[type].forEach((handler) => {
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
   */
  addHandler(prop, handler) {
    if (!Array.isArray(this.handlers[prop])) {
      this.handlers[prop] = [];
    }
    this.handlers[prop].push(handler.bind(this));
  }

}

const socket = new WS();

module.exports.socket = socket;
