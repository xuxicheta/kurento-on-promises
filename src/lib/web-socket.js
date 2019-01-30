import { v4 } from 'uuid';
const URI = `wss://${window.location.hostname}:${window.location.port}/ws`;

class WS {
  /**
   * @param {string} uri
   */
  constructor(uri) {

    this.sessionId = this.getSessionId();
    this.uri = `${uri}?${this.sessionId}`;

    this.handlers = {};
    this.waitings = [];
    this.socketInit();
  }

  /**
   * @returns {string}
   */
  getSessionId() {
    if (localStorage.getItem('sessionId')) {
      return localStorage.getItem('sessionId');
    }
    const sessionId = v4();
    localStorage.setItem('sessionId', sessionId);
    return sessionId;
  }

  socketInit() {
    this.socket = new WebSocket(this.uri);

    this.socket.onmessage = ({ dataString }) => {
      try {
        const data = JSON.parse(dataString);

        /** @type {string} */
        const type = data.type;

        if (Array.isArray(this.handlers[type])) {
          this.handlers[type].forEach((func) => {
            func(data.data);
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    this.socket.onopen = () => {
      console.log(`socket ${this.uri} opened, session ${this.sessionId}`);
      if (this.socket.OPEN) {
        this.waitings.forEach((msg) => {
          this.socket.send(msg);
        });
        this.waitings = [];
      }
    };

    this.socket.onclose = () => {
      console.warn(`socket ${this.uri} closed, session ${this.sessionId}`);
      setTimeout(() => {
        this.socketInit();
      }, 10000);
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
      this.waitings.push(msg);
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
