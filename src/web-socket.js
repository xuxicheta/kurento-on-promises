import { v4 } from 'uuid';
const URI = `wss://${window.location.hostname}:${window.location.port}/ws`;

export class WS {
  constructor(uri) {
    this.uri = uri;
    /** @type {WebSocket} */

    if (localStorage.getItem('sessionId')) {
      this.sessionId = localStorage.getItem('sessionId');
    } else {
      this.sessionId = v4();
      localStorage.setItem('sessionId', this.sessionId);
    }
    this.handlers = {};
    this.waitings = [];
    this.socketInit();


  }

  socketInit() {
    this.socket = new WebSocket(this.uri);

    this.socket.onmessage = ({ data }) => {
      try {
        const dataParsed = JSON.parse(data);
        const type = dataParsed.type;
        if (Array.isArray(this.handlers[type])) {
          this.handlers[type].forEach((func) => {
            func(dataParsed.data);
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    this.socket.onopen = () => {
      console.log(`socket ${this.uri} opened, session ${this.sessionId}`);
      this.socket.send(JSON.stringify({
        type: 'session/greetings',
        sessionId: this.sessionId,
      }));

      this.waitings.forEach(func => func());
    };

    this.socket.onclose = () => {
      console.warn(`socket ${this.uri} closed, session ${this.sessionId}`);
      setTimeout(() => {
        this.socketInit();
      }, 5000);
    };

    this.socket.onerror = () => {
      console.error(`socket ${this.uri} error, session ${this.sessionId}`);
    };
  }


  /**
   * @param {string} type
   * @param {*} data
   */
  sendData(type, data = '') {
    const msg = JSON.stringify({
      type,
      data,
      sessionId: this.sessionId,
    });
    if (this.socket && this.socket.readyState === 1) {
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

  /**
   * @param {string} prop
   */
  clearHandlers(prop) {
    this.handlers[prop] = null;
  }

  /**
   * @param {string} prop
   * @param {wsHandlerCallback} handler
   */
  setHandler(prop, handler) {
    this.clearHandlers(prop);
    this.addHandler(prop, handler);
    return this;
  }
}

export const socket = new WS(URI);

socket.setHandler('session/ping', () => socket.sendData('pong', ''));
