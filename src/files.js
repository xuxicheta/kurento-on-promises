import { socket } from './web-socket';
import { ui } from './ui/ui';

export class Files {
  constructor() {
    this.list = [];
    this.html = '';
    this.assingSocketListeners();
    this.refresh();
  }

  assingSocketListeners() {
    socket.addHandler('files/list', (data) => {
      /** @type {string[]} */
      this.list = data;
      ui.directPlayer.setFiles(this.list);
    });
  }

  refresh() {
    socket.sendData('files/request', '');
  }
}

export const files = new Files();
