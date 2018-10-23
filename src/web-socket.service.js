import { v4 } from 'uuid';
const URI = `wss://${window.location.hostname}:${window.location.port}/ws`;

export class WS {
  constructor(uri) {
    /** @type {WebSocket} */
    this.socket = new WebSocket(uri);
    this.sessionId = v4();
    this.handlers = {};
    this.waitings = [];

    this.socket.onmessage = ({ data }) => {
      // console.log(data);

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
      this.socket.send(JSON.stringify({
        type: 'session/greetings',
        sessionId: this.sessionId,
      }));

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
      sessionId: this.sessionId,
    });
    if (this.socket.readyState === 1) {
      this.socket.send(msg);
    } else {
      this.waitings.push(() => this.socket.send(msg));
    }
  }

  /**
   * @callback wsHandlerCallback
   * @param {*} data
   */

  /**
   * @param {string} prop
   * @param {wsHandlerCallback} handler
   */
  addHandler(prop, handler) {
    if (Array.isArray(this.handlers[prop])) {
      this.handlers[prop].push(handler);
    } else {
      this.handlers[prop] = [handler];
    }
  }

  clearHandlers(prop) {
    this.handlers[prop] = null;
  }
}

export const socket = new WS(URI);

socket.addHandler('session/ping', () => socket.send('pong', ''));
