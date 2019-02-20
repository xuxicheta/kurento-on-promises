//@ts-check

/**
 * @typedef {object} MessageData
 * @property {string} method
 * @property {any} params
 * @property {number} id
 * @property {string} [sessionId]
 */

const { EventEmitter } = require('events');

const { MediaService } = require('./media.service');
const { FilesService } = require('./files.service');
const logger = require('../modules/logger/logger.module');
const log = logger.log;
const SESSION = logger.color.blue('SESSION');

class Session extends EventEmitter {
  /**
   * @param {string} sessionId
   */
  constructor(sessionId) {
    super();
    this.createdAt = new Date();
    this.sessionId = sessionId;
    this.outcomeMessageId = 0;
    this.dyingTimeout = null;
    /** @type {import('ws')[]} */
    this.connections = [];
    this.isClosed = false;

    const sendData = this.sendData.bind(this);
    this.mediaService = new MediaService({ sendData });
    this.filesService = new FilesService({ sendData });

    logger.log(`${SESSION} created "${this.sessionId}"`);
  }

  /**
   * @param {import('ws').Data} message
   */
  onMessage(message) {
    try {
      /** @type {MessageData} */
      const messageData = JSON.parse(message.toString());
      if (process.env.WS_LOG) {
        switch (messageData.method) {
          case 'media/localCandidate':
            break;
          case 'media/sdpOffer':
            log(logger.color.red('in'), JSON.stringify({
              ...messageData,
              params: { ...messageData.params, sdpOffer: messageData.params.sdpOffer && '' },
            }));
            break;
          default:
            log(logger.color.red('in '), message);
        }
      }
      this.onMessageData(messageData);
    } catch (error) {
      logger.error(error);
    }
  }

  /**
   * @param {MessageData} messageData
   */
  onMessageData(messageData) {
    if (!(messageData && messageData.method)) {
      return;
    }

    switch (true) {
      case /^media/.test(messageData.method):
        this.mediaService.onMediaMessageData(messageData);
        break;
      case /^files/.test(messageData.method):
        this.filesService.onFilesMessageData(messageData);
        break;
      default:
    }
  }

  close() {
    if (this.isClosed) {
      return;
    }
    this.emit('close');
    this.isClosed = true;
    this.connections.forEach(connection => connection.close());
    this.removeAllListeners();
    logger.log(`${SESSION} closed "${this.sessionId}"`);
  }

  resume() {
    logger.log(SESSION, 'resume');
    clearTimeout(this.dyingTimeout);
    this.dyingTimeout = null;
  }

  startDying() {
    this.dyingTimeout = setTimeout(() => this.close(), 10000);
    logger.log(SESSION, 'start dying');
  }

  /**
   * @param {string} method
   * @param {*} params
   */
  sendData(method, params = null) {
    /** @type {MessageData} */
    const outMessageData = {
      method,
      params,
      id: this.outcomeMessageId++,
    };
    const message = JSON.stringify(outMessageData);


    if (process.env.WS_LOG) {
      switch (outMessageData.method) {
        case 'media/remoteCandidate':
          break;
        case 'media/sdpAnswer':
          log(logger.color.blue('out'), JSON.stringify({
            ...outMessageData,
            params: { ...outMessageData.params, sdpAnswer: outMessageData.params.sdpAnswer && '' },
          }));
          break;
        default:
          log(logger.color.magenta('out'), message);
      }
    }

    this.connections.forEach((ws) => {
      if (ws.readyState !== ws.OPEN) {
        return;
      }
      ws.send(message);
    });
  }

  /**
   * @param {import('ws')} ws
   */
  adsorbConnection(ws) {
    this.connections.push(ws);
    if (this.dyingTimeout) {
      this.resume();
    }
    ws.on('message', message => this.onMessage(message));
    ws.on('close', () => {
      this.connections = this.connections.filter(connection => connection !== ws);
      if (this.connections.length === 0) {
        this.startDying();
      }
    });
  }
}

module.exports.Session = Session;
