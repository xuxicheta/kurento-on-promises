const KurentoClient = require('kurento-client');
const { green } = require('chalk').default;
const { MediaPipeline } = require('kurento-client-core'); // eslint-disable-line
const { WebRtcEndpoint, RecorderEndpoint, PlayerEndpoint } = require('kurento-client-elements'); // eslint-disable-line
const config = require('./config.lib');
const socket = require('./web-socket.lib');

class MediaClass {
  /**
   *
   * @param {WebSocket} ws
   * @param {string} offer
   */
  constructor(ws, offer) {
    this.client = null;
    /** @type {MediaPipeline} */
    this.pipeline = null;
    /** @type {WebRtcEndpoint} */
    this.webRtcEndpoint = null;
    /** @type {RecorderEndpoint} */
    this.recordEndpoint = null;
    /** @type {RecorderEndpoint} */
    this.fileRecordEndpoint = null;
    /** @type {PlayerEndpoint} */
    this.playerEndpoint = null;

    this.candidatesQueue = [];
    this.ws = ws;
    this.offer = offer;
    this.answer = '';
    this.STUN = '';
    this.TURN = '';
    this.pairs = null;
    this.init();
  }

  /**
   * @async
   */
  async init() {
    //@ts-ignore
    if (!MediaClass.client) {
      this.client = await KurentoClient(config.get('kurentoWsUri'));
      MediaClass.client = this.client;
      console.log('MEDIA created client');
    } else {
      this.client = MediaClass.client;
    }

    this.pipeline = await this.client.create('MediaPipeline');
    console.log(`MEDIA created pipeline "${this.pipeline.id}"`);

    this.webRtcEndpoint = await this.createWebRtcEndpoint(this.offer);

    /** @type {any[]} */
    this.pairs = await this.webRtcEndpoint.getICECandidatePairs();
    this.pairs.forEach((pair) => {
      console.log(`MEDIA local candidate ${pair.localCandidate}`);
      this.sendLog('local candidate', pair.localCandidate);

      console.log(`MEDIA remote candidate ${pair.remoteCandidate}`);
      this.sendLog('remote candidate', pair.remoteCandidate);

    });
  }

  async createWebRtcEndpoint(offer) {
    const webRtcEndpoint = await this.pipeline.create('WebRtcEndpoint');
    console.log(`MEDIA created webRtcEndpoint "${webRtcEndpoint.id}"`);

    while (this.candidatesQueue.length) {
      webRtcEndpoint.addIceCandidate(this.candidatesQueue.shift(), () => { });
    }
    this.setDebugListeners(webRtcEndpoint);
    this.sendCandidatesToClient(webRtcEndpoint);
    this.answer = await webRtcEndpoint.processOffer(offer);

    await this.gatherCandidates(webRtcEndpoint);

    this.STUN = await webRtcEndpoint.getStunServerAddress();
    this.TURN = await webRtcEndpoint.getTurnUrl();
    process.nextTick(() => {
      this.sendData('media/answer', this.answer);
    });

    return webRtcEndpoint;
  }

  /**
   * @param {WebRtcEndpoint} webRtcEndpoint
   */
  setDebugListeners(webRtcEndpoint) {
    /** taken from source kurento-client */
    const eventsArray = [
      // webRtcEndpoint events
      'DataChannelClose',
      'DataChannelOpen',
      // 'IceCandidateFound',
      'IceComponentStateChange',
      'IceGatheringDone',
      'NewCandidatePairSelected',
      'OnDataChannelClosed',
      'OnDataChannelOpened',
      // 'OnIceCandidate',
      // 'OnIceComponentStateChanged',
      'OnIceGatheringDone',
      'MediaFlowInStateChange',
      'MediaFlowOutStateChange',
      // BaseEndpoint events
      'ConnectionStateChanged',
      'MediaStateChanged',
    ];

    eventsArray.forEach((eventName) => {
      webRtcEndpoint.on(eventName, (event) => {
        switch (event.type) {
          case 'NewCandidatePairSelected':
            webRtcEndpoint.getICECandidatePairs().then((pairs) => {
              pairs.forEach((pair) => {
                // console.log(pair);
                console.log(`PAIR local ${pair.localCandidate}`);
                console.log(`PAIR remote ${pair.remoteCandidate}`);
              });
            });
            break;
          // case 'MediaFlowInStateChange':
          //   console.log(event);
          //   break;
          case 'MediaFlowOutStateChange':
            if (event.mediaType === 'VIDEO') {
              console.log('FLOWING Video Out');
            }
            break;
          default:
        }
        // console.log(`EVENT ${event.type}`);
        // console.log(event);
        this.sendData('media/event', event);
      });
    });


  }

  /**
   * @param {WebRtcEndpoint} webRtcEndpoint
   */
  sendCandidatesToClient(webRtcEndpoint) {
    webRtcEndpoint.on('OnIceCandidate', (event) => {
      const candidate = KurentoClient.getComplexType('IceCandidate')(event.candidate);
      this.sendData('media/remoteCandidate', candidate);
      // console.log(`remote ${candidate.candidate}`);
    });
  }

  /**
   * @param {string} type
   * @param {*} data
   */
  sendData(type, data = '') {
    this.ws.sendData(type, data);
  }

  /**
   * @param {string} header
   * @param {string} message
   */
  sendLog(header, message) {
    this.sendData('log/append', {
      header,
      message,
    });
  }

  addWebRtcEndpointCandidates(data) {
    const candidate = KurentoClient.getComplexType('IceCandidate')(data);
    if (this.webRtcEndpoint) {
      this.webRtcEndpoint.addIceCandidate(candidate);
    } else {
      this.candidatesQueue.push(candidate);
    }
  }

  async mirror() {
    return this.webRtcEndpoint.connect(this.webRtcEndpoint);
  }


  /**
   * @async
   * @param {WebRtcEndpoint} webRtcEndpoint
   * @param {string} uri
   * @param {string?} prefix
   */
  async createRecordEndpoint(webRtcEndpoint, uri, prefix = '') {

    const strTime = new Date().toLocaleString().replace(' ', '_');
    const recordEndpoint = await this.pipeline.create('RecorderEndpoint', {
      uri: `${uri}/${prefix}${strTime}.mp4`,
      // mediaProfile: 'MP4',
    });

    await webRtcEndpoint.connect(recordEndpoint);
    recordEndpoint.record();
    console.log(`MEDIA recording starting "${await recordEndpoint.getUri()}"`);

    recordEndpoint.on('Recording', async () => {
      console.log(`MEDIA recording started "${await recordEndpoint.getUri()}"`);
      this.sendData('media/record-started', await recordEndpoint.getUri());
      this.sendLog('record', `started "${await recordEndpoint.getUri()}"`);
    });

    recordEndpoint.on('Stopped', async () => {
      console.log(`MEDIA record stopped "${await recordEndpoint.getUri()}"`);
      this.sendLog('record', `stopped "${await recordEndpoint.getUri()}"`);
    });

    return recordEndpoint;
  }

  /**
   * @async
   * @param {RecorderEndpoint} recordEndpoint
   */
  async stopRecord(recordEndpoint) {
    if (recordEndpoint && recordEndpoint.release) {
      this.sendLog('record', `stoping ${await recordEndpoint.getUri()}`);
      recordEndpoint.release();

    }
  }

  /**
   * @async
   */
  async stop() {
    console.log('MEDIA stopped');

    await this.stopRecord();

    if (this.webRtcEndpoint && this.webRtcEndpoint.release) {
      this.webRtcEndpoint.release();
    }
    if (this.pipeline && this.pipeline.release) {
      this.pipeline.release();
    }
    this.sendData('media/stopped');
  }

  async gatherCandidates(webRtcEndpoint) {
    return new Promise((resolve, reject) => {
      webRtcEndpoint.gatherCandidates((error) => {
        if (error) {
          reject(error);
        }
        this.sendLog('media', 'candidates gathered');
        resolve();
      });
    });
  }

  static assignWebSocket() {
    socket
      .setHandler('media/offer', (data, ws) => {
        ws.media = new MediaClass(ws, data);
      })
      .setHandler('media/localCandidate', (data, ws) => {
        /** @type {MediaClass} */
        const media = ws.media;
        if (media && media.addWebRtcEndpointCandidates) {
          media.addWebRtcEndpointCandidates(data);
        }
        console.log(`local ${green(data.candidate)}`);
      })
      .setHandler('media/stop', (data, ws) => {
        /** @type {MediaClass} */
        const media = ws.media;
        if (media && media.stop) {
          media.stop();
        }
      })
      .setHandler('media/mirror', (data, ws) => {
        /** @type {MediaClass} */
        const media = ws.media;
        media.mirror();
      })
      .setHandler('media/record-start', async (data, ws) => {
        const recordUrl = `http://${config.get('recordIp')}:${config.get('httpPort')}/${config.get('recordEndpoint')}`;
        /** @type {MediaClass} */
        const media = ws.media;
        if (media && media.createRecordEndpoint) {
          media.recordEndpoint = await media.createRecordEndpoint(media.webRtcEndpoint, recordUrl, 'stream_');
        }
      })
      .setHandler('media/record-start-tofile', async (data, ws) => {
        const fileRecordUrl = `file://${config.get('kurentoFilesPath')}`;
        /** @type {MediaClass} */
        const media = ws.media;
        if (media && media.createRecordEndpoint) {
          media.fileRecordEndpoint = await media.createRecordEndpoint(media.webRtcEndpoint, fileRecordUrl, 'file_');
        }
      })
      .setHandler('media/record-stop', (data, ws) => {
        /** @type {MediaClass} */
        const media = ws.media;
        if (media && media.stopRecord) {
          if (media.recordEndpoint) {
            media.stopRecord(media.recordEndpoint);
          }
          if (media.fileRecordEndpoint) {
            media.stopRecord(media.fileRecordEndpoint);
          }
        }
      })
      .setHandler('player/offer', (data, ws) => {
        const player = new MediaClass(ws, data);
        ws.player = player;
        console.log({ player });
      });
  }
}

module.exports = { MediaClass };
