const ws = require('ws');
const DEFAULT_WS_PORT = 3001;
const WS_PORT = process.env.WS_PORT || DEFAULT_WS_PORT;

class WS {
  constructor() {
    this.ws = new ws.Server({
      port: WS_PORT,
    });
    this.clients = [];
    this.handlers = {};

    this.ws.on('connection', (socket) => {
      const _this = this;
      this.clients.push(socket);
      socket.onclose = () => {
        this.clients = this.clients.filter(client => client !== socket);
      };

      socket.on('message', (message) => {
        console.log('WS: received: %s', message);
        try {
          const data = JSON.parse(message);         
          if (Array.isArray(_this.handlers[data.type])) {
            _this.handlers[data.type].forEach((handler) => {
              handler(data.data, socket);
            });
          }
        } catch (error) {
          console.error(error);
        }
      });

      // socket.send(JSON.stringify('something'));
    });
  }

  addHandler(prop, handler) {
    if (Array.isArray(this.handlers[prop])) {
      this.handlers[prop].push(handler.bind(this));
    } else {
      this.handlers[prop] = [handler];
    }
  }

}

const socket = new WS();

module.exports.socket = socket;
