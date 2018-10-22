import { socket } from './web-socket.service';
import { MyEvent } from './my-event.class';

export class Config extends MyEvent {
  constructor() {
    super();
    this.data = {};
    socket.addHandler('config/all', (data) => {
      Object.assign(this.data, data);
      this.emit(this.data);
    });
    socket.send('config/fetch');

    this.resolved = new Promise((resolve, reject) => {
      this.once((value) => {
        console.log('config received', config.getAll());

        resolve(value);
      });
      setTimeout(() => reject(new Error('timeout')), 2000);
    });
  }

  set(prop, value) {
    socket.send('config/patch', { [prop]: value });
    this.data[prop] = value;
    this.emit(this.data);
  }

  getAll() {
    return this.data;
  }

  get(prop) {
    return this.data[prop];
  }
}

export const config = new Config();
