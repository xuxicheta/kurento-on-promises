const URI = 'ws://localhost:3001';

export class WS {
  constructor(uri) {
    /** @type {WebSocket} */
    this.socket = new WebSocket(uri);
    this.handlers = {};
    this.waitings = [];

    this.socket.onmessage = ({ data }) => {
      console.log(data);
      
      try {
        const dataParsed = JSON.parse(data);
        /** @type {function[]} */
        const handlers = [].concat(this.handlers[dataParsed.type] || []);
        handlers.forEach((func) => {
          func(dataParsed.data);
        });
      } catch (error) {
        console.error(error);
      }
    };

    this.socket.onopen = () => {
      this.waitings.forEach(func => func());
    };
  }


  /**
   * @param {string} type
   * @param {*} data
   */
  send(type, data = '') {
    const msg = JSON.stringify({
      type,
      data,
    });
    if (this.socket.readyState === 1) {
      this.socket.send(msg);
    } else {
      this.waitings.push(() => this.socket.send(msg));
    }
  }

  addHandler(prop, handler) {
    if (Array.isArray(this.handlers[prop])) {
      this.handlers[prop].push(handler);
    } else {
      this.handlers[prop] = [handler];
    }
  }
}

export const socket = new WS(URI);

// webSocket.onopen = () => {
//   webSocket.send('something');
// };

// webSocket.onmessage = (data) => {
//   console.log('WS: ', data);
// };
