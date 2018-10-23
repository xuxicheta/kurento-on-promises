import { socket } from './web-socket.service';
import { ui } from './ui';

export class Files {
  constructor() {
    this.list = [];
    this.html = '';
    this.assingSocketListeners();
    this.refresh();
  }

  assingSocketListeners() {
    socket.addHandler('files/list', (data) => {
      this.list = data;
      this.html = this.list.map(file => `<div><a>${file}</a></div>`).join('\n');
      ui.set('fileList', this.html);
      ui.enliveFileList();
    });
  }

  refresh() {
    socket.send('files/request', '');
  }
}

export const files = new Files();
