
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const config = require('./config.lib');

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

  assignWebSocket(socket) {
    socket
      .setHandler('files/request', (session) => {
        this.readDir()
          .then((items) => {
            session.sendData('files/list', items);
          });
      })
      .setHandler('files/check-url', (session, data) => {
        const fileName = path.join(this.filesDir, data);
        pExists(fileName)
          .then(() => {
            session.sendData('player/file-found', data);
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
