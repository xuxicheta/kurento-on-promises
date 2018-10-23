
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { ConfigModule } = require('./config.module');
const { WebSocketModule } = require('./web-socket.module');

const pReadDir = promisify(fs.readdir);

class FilesModule {
  constructor() {
    if (FilesModule._instance) {
      throw new Error('attempt to create singleton again');
    }
    const config = ConfigModule.instance;

    this.filesDir = path.join(config.globalDirName, config.get('filePath'));
    FilesModule._instance = this;
    FilesModule.assignWebSocket();
  }

  /**
   * @returns {string[]}
   */
  async readDir() {
    const files = await pReadDir(this.filesDir);
    return files;
  }

  /**
   * @param {WebSocketModule} socket
   */
  static assignWebSocket() {
    const socket = WebSocketModule.instance;
    const files = FilesModule.instance;
    if (!FilesModule['files/request']) {
      FilesModule['files/request'] = socket.addHandler('files/request', (data, ws) => {
        files.readDir()
          .then((items) => {
            ws.sendData('files/list', items);
          });
      });
    }
  }

  /**
   * @returns {FilesModule}
   */
  static get instance() {
    return FilesModule._instance;
  }

}

FilesModule._instance = null;

module.exports = { FilesModule };
