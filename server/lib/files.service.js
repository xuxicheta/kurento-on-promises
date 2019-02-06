
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { config } = require('../config');

const logger = require('../modules/logger/logger.module');
const FILES = logger.color.magenta('MEDIA');

const pReadDir = promisify(fs.readdir);

class FilesService {
  constructor({ sendData }) {
    /** @type {(method: string, params?: any) => void} */
    this.sendData = sendData;
    this.filesDir = config.filesPath;
  }

  /**
   * @param {import('./web-socket.unit').MessageData} messageData
   */
  onFilesMessageData(messageData) {
    switch (messageData.type) {
      case 'files/getList':
        this.onGetList();
        break;
      default:
    }
  }

  async onGetList() {
    try {
      const files = await pReadDir(this.filesDir);
      this.sendData('files/list', { files });
    } catch (error) {
      logger.error(FILES, error);
      this.sendData('files/list', { files: null });
    }
  }
}

module.exports.FilesService = FilesService;
