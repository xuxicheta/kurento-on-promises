
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const config = require('./config.lib');
const socket = require('./web-socket.lib');

const pReadDir = promisify(fs.readdir);
const pExists = promisify(fs.exists);

class FilesModule {
  constructor() {
    this.filesDir = path.join(config.globalDirName, config.get('filesPath'));
  }

  /**
   * @returns {string[]}
   */
  async readDir() {
    try {
      const files = await pReadDir(this.filesDir);
      return files;
    } catch (error) {
      console.error('FILES error', error);
    }
  }

  assignWebSocket() {
    socket
      .setHandler('files/request', (data, ws) => {
        this.readDir()
          .then((items) => {
            ws.sendData('files/list', items);
          });
      })
      .setHandler('files/check-url', (data, ws) => {
        const fileName = path.join(this.filesDir, data);
        pExists(fileName)
          .then(() => {
            ws.sendData('player/file-found', fileName);
          });
      });
  }

  readCertificates() {
    try {
      const certDir = path.resolve(config.globalDirName, 'cert', config.get('nodeHostname'));
      if (!fs.existsSync(certDir)) {
        return null;
      }
      return {
        key: fs.readFileSync(`${certDir}/privkey.pem`).toString(),
        cert: fs.readFileSync(`${certDir}/fullchain.pem`).toString(),
        ca: fs.readFileSync(`${certDir}/chain.pem`).toString(),
      };
    } catch (error) {
      console.error('FILE', error);
      return null;
    }
  }
}


module.exports = new FilesModule();
