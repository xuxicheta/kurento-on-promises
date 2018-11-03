//@ts-check
const WebSocket = require('ws');
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
        console.error(`WS failed to send data, type "${type}"  session ${ws.session.sessionId}`);
        return false;

      };

      ws.onclose = () => {
        this.clients = this.clients.filter(client => client !== ws);
      };

      ws.on('message', (message) => {
        try {
          // console.log('WS', message);
          const { type, data, sessionId } = JSON.parse(message.toString());

          if (!Array.isArray(_this.handlers[type])) {
            const error = new DetailedError('unrecognized incoming socket');
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
