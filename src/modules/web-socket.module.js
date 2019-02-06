//@ts-check
import { v4 } from 'uuid';
import { logger } from './logger.module';
const WS = logger.color.cyan('WS');

export class WebSocketModule extends EventTarget {
  constructor() {
    super();
    this.sessionId = this.getSessionId();
    this.uri = `wss://${window.location.hostname}:${window.location.port}/ws?${this.sessionId}`;

    this.handlers = {};
    this.waitings = [];
    this.socketInit();
  }

  emit(eventName, data) {
    this.dispatchEvent(new CustomEvent(eventName, { detail: data }));
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
    this.socket.addEventListener('open', () => {
      logger.log(`${WS} socket ${this.uri} opened, session ${this.sessionId}`);
    });
    this.socket.addEventListener('close', () => {
      logger.warn(`${WS} socket ${this.uri} closed, session ${this.sessionId}`);
      setTimeout(() => {
        this.socketInit();
      }, 10000);
    });
    this.socket.addEventListener('message', (evt) => {
      this.emit('message', evt.data);
    });
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
