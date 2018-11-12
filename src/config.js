import { socket } from './web-socket.service';
import { MyEvent } from './my-event.class';
import { ui } from './ui';

export class Config extends MyEvent {
  constructor() {
    super();
    this.data = {
      recordDir: 'files',
    };
    socket.addHandler('config/all', (data) => {
      Object.assign(this.data, data);
      this.emit(this.data);
    });
    socket.sendData('config/fetch');

    /** wait till config is ready */
    this.resolved = new Promise((resolve, reject) => {
      this.once((value) => {
        console.log('config received', config.getAll());

        resolve(value);
      });
      setTimeout(() => reject(new Error('timeout')), 2000);
    });
  }

  /**
   * @param {string} prop
   * @param {*} value
   */
  set(prop, value) {
    socket.sendData('config/patch', { [prop]: value });
    this.data[prop] = value;
    this.emit(this.data);
  }

  getAll() {
    return this.data;
  }

  /**
   * @param {string} prop
   */
  get(prop) {
    return this.data[prop];
  }
}

export const config = new Config();

config.on(() => {
  ui.set('wsUri', config.get('kurentoWsUri'));
});
