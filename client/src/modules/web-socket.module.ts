//@ts-check
import { v4 } from 'uuid';
import { EventEmitter } from 'events';
import { logger } from './logger.module';
const WS = logger.color.cyan('WS');

export class WebSocketModule extends EventEmitter {
  sessionId = this.getSessionId();
  uri = `wss://${window.location.hostname}:${window.location.port}/ws?${this.sessionId}`;
  socket: WebSocket;
  waitings: string[] = [];
  counter = 0;

  constructor() {
    super();
    this.sessionId = this.getSessionId();
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
    this.socket.addEventListener('open', () => {
      logger.log(`${WS} socket ${this.uri} opened, session ${this.sessionId}`);
      while (this.waitings.length) {
        this.socket.send(this.waitings.shift());
      }
    });
    this.socket.addEventListener('close', () => {
      logger.warn(`${WS} socket ${this.uri} closed, session ${this.sessionId}`);
      setTimeout(() => {
        this.socketInit();
      }, 10000);
    });
    this.socket.addEventListener('message', (evt) => {
      try {
        const incomingData = JSON.parse(evt.data);
        this.emit(incomingData.method, incomingData.params);
      } catch (error) {
        logger.error(WS, error);
      }
    });
  }


  /**
   * @param {string} type
   * @param {*} data
   */
  sendData(method: string, params: any = null) {
    const msg = JSON.stringify({
      method,
      params,
      id: this.counter++,
      sessionId: this.sessionId,
    });
    if (this.socket && this.socket.readyState === 1) {
      this.socket.send(msg);
    } else {
      this.waitings.push(msg);
    }
  }
}
