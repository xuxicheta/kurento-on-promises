
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { socket, WebSocketModule } = require('./web-socket.module'); // eslint-disable-line
const { config } = require('./config.module');

const pReadDir = promisify(fs.readdir);

class FilesModule {
  constructor() {
    this.filesDir = path.join(config.globalDirName, config.get('filePath'));
    console.log(this.filesDir);
  }

  async readDir() {
    const files = await pReadDir(this.filesDir);
    return files;
  }

}

const files = new FilesModule();

socket.addHandler('files/request', (data, ws) => {
  files.readDir()
    .then((items) => {
      ws.sendData('files/list', items);
    });
});

module.exports.files = files;
module.exports.FilesModule = FilesModule;
