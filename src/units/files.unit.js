//@ts-check
import { socket } from '../lib/web-socket';

export class FilesUnit {
  constructor() {
    this.list = [];
    this.html = '';
    this.listenSocket();
    this.refresh();
  }

  emit() {
    document.dispatchEvent(new CustomEvent('files', { detail: this.list }));
  }

  on(cb) {
    document.addEventListener('files', cb);
  }

  listenSocket() {
    socket.setHandler('files/list', (data) => {
      /** @type {string[]} */
      this.list = data;
      this.emit();
    });
  }

  refresh() {
    socket.sendData('files/request', '');
  }
}
