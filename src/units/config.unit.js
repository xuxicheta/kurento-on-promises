//@ts-check
import { socket } from '../lib/web-socket';

export class ConfigUnit {
  constructor() {
    this.data = {
      recordDir: 'files',
    };
    this.listenSocket();
    socket.sendData('config/fetch');
  }

  /**
   * @param {string} prop
   * @param {*} value
   */
  set(prop, value) {
    socket.sendData('config/patch', { [prop]: value });
    this.data[prop] = value;
    this.emit();
  }

  /**
   * @param {string} prop
   */
  get(prop) {
    return this.data[prop];
  }

  emit() {
    document.dispatchEvent(new CustomEvent('config', { detail: this.data }));
  }

  on(cb) {
    document.addEventListener('config', cb);
  }

  listenSocket() {
    socket.setHandler('config/all', (data) => {
      Object.assign(this.data, data);
      this.emit();
    });
  }
}
