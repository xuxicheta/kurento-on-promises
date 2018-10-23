const WebSocket = require('ws');

const DEFAULT_WS_PORT = 3001;
const WS_PORT = process.env.WS_PORT || DEFAULT_WS_PORT;

class WebSocketModule {
  constructor() {
    this.wsServer = new WebSocket.Server({
      port: +WS_PORT,
    });
    this.clients = [];
    this.handlers = {};
    /**
     * @param {string} type
     * @param {*} data
     */
    this.sendData = (type, data) => undefined; // eslint-disable-line

    this.wsServer.on('connection', (ws) => {
      const _this = this;
      this.clients.push(ws);

      //@ts-ignore
      ws.sendData = (type, data) => {
        const str = JSON.stringify({
          type,
          data,
        });
        if (ws.readyState === 1) {
          ws.send(str);
          return true;
        }
        //@ts-ignore
        console.error('attemt to send data in closed WebSocket', 'sessionId', type, ws.session.sessionId);
        return false;

      };

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

const socket = new WebSocketModule();

module.exports.WebSocketModule = WebSocketModule;
module.exports.socket = socket;
