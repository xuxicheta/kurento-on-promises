//@ts-check
const { EventEmitter } = require('events');

const { MediaService } = require('./media.service');
const { FilesService } = require('./files.service');
const logger = require('../modules/logger/logger.module');
const SESSION = logger.color.magenta('SESSION');

class Session extends EventEmitter {
  /**
   * @param {string} sessionId
   */
  constructor(sessionId) {
    super();
    this.createdAt = new Date();
    this.sessionId = sessionId;
    this.outcomeMessageId = 0;

    const sendData = this.sendData.bind(this);
    this.mediaService = new MediaService({ sendData });
    this.filesService = new FilesService({ sendData });
  }

  /**
   * @param {import('./web-socket.unit').MessageData} messageData
   */
  onMessageData(messageData) {
    if (!messageData.type) {
      return;
    }
    if (/^media/.test(messageData.type)) {
      this.mediaService.onMediaMessageData(messageData);
    } else if (/^files/.test(messageData.type)) {
      this.filesService.onFilesMessageData(messageData);
    }
  }

  close() {
    this.emit('close');
    this.removeAllListeners();
    logger.log(`${SESSION} <<< "${this.sessionId}" closed`);
  }

  /**
   * @param {string} method
   * @param {*} params
   */
  sendData(method, params = null) {
    this.emit('outcomeData', {
      method,
      params,
      id: this.outcomeMessageId++,
    });
  }
}

module.exports.Session = Session;
