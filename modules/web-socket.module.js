const WebSocket = require('ws');

// const DEFAULT_WS_PORT = 3001;
// const WS_PORT = process.env.WS_PORT || DEFAULT_WS_PORT;

class WebSocketModule {
  constructor(server) {
    if (WebSocketModule._instance) {
      throw new Error('attempt to create singleton again');
    }

    this.wsServer = new WebSocket.Server({
      server,
      path: '/ws',
    });
    console.log(this.wsServer);

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
    WebSocketModule._instance = this;
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
    return handler;
  }

  /**
   * @returns {WebSocketModule}
   */
  static get instance() {
    return WebSocketModule._instance;
  }

}


module.exports = { WebSocketModule };
