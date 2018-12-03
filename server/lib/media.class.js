//@ts-check
const KurentoClient = require('kurento-client');
const { green } = require('chalk').default;
const { MediaPipeline } = require('kurento-client-core'); // eslint-disable-line
const { WebRtcEndpoint, RecorderEndpoint, PlayerEndpoint } = require('kurento-client-elements'); // eslint-disable-line

const config = require('./config.lib');

class MediaClass {
  /**
   * @param {string} offer
   */
  constructor(offer) {
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

    /**
     * @param {string} type
     * @param {*} data
     */
    this.sendData = (type, data = '') => { }; // eslint-disable-line

    this.candidatesQueue = [];
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

    this.client = await this.getClient();
    this.pipeline = await this.client.create('MediaPipeline');
    //@ts-ignore
    console.log(`MEDIA created pipeline "${this.pipeline.id}"`);

    this.webRtcEndpoint = await this.createWebRtcEndpoint(this.offer);

    /** @type {any[]} */
    //@ts-ignore
    this.pairs = await this.webRtcEndpoint.getICECandidatePairs();
    this.pairs.forEach((pair) => {
      console.log(`MEDIA local candidate ${pair.localCandidate}`);
      this.sendLog('local candidate', pair.localCandidate);

      console.log(`MEDIA remote candidate ${pair.remoteCandidate}`);
      this.sendLog('remote candidate', pair.remoteCandidate);

    });
  }

  /**
   * @returns {Promise<KurentoClient>}
   */
  async getClient() {
    try {
      const wsUri = config.get('kurentoWsUri');
      if (!MediaClass.client) {
        /** @type {string} */
  
        /** @type {KurentoClient} */
        //@ts-ignore
        MediaClass.client = await KurentoClient(wsUri);
  
        //@ts-ignore
        MediaClass.client.once('disconnect', async () => {
          console.log('MEDIA kurento disconnected, trying to connect');
          await this.stop();
          setTimeout(() => {
            this.getClient();
          }, 5000);
        });
        console.log('MEDIA created client', wsUri);
  
      }
      // console.log(MediaClass.client);
      return MediaClass.client;
    } catch (error) {
      console.error(error);
    }
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
      //@ts-ignore

      webRtcEndpoint.on(eventName, (event) => {
        switch (event.type) {
          case 'NewCandidatePairSelected':
            //@ts-ignore

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
    //@ts-ignore

    webRtcEndpoint.on('OnIceCandidate', (event) => {
      //@ts-ignore
      const candidate = KurentoClient.getComplexType('IceCandidate')(event.candidate);
      this.sendData('media/remoteCandidate', candidate);
      console.log(`remote ${candidate.candidate}`);
    });
  }

  onSend(cb) {
    this.sendData = cb;
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
    //@ts-ignore
    const candidate = KurentoClient.getComplexType('IceCandidate')(data);
    if (this.webRtcEndpoint) {
      //@ts-ignore
      this.webRtcEndpoint.addIceCandidate(candidate);
    } else {
      this.candidatesQueue.push(candidate);
    }
  }

  async mirror() {
    //@ts-ignore

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

    //@ts-ignore
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
    //@ts-ignore
    if (recordEndpoint && recordEndpoint.release) {
      //@ts-ignore
      this.sendLog('record', `stoping ${await recordEndpoint.getUri()}`);
      //@ts-ignore
      recordEndpoint.release();

    }
  }

  /**
   * @async
   */
  async stop() {
    console.log('MEDIA stopped');

    await this.stopRecord(this.recordEndpoint);
    //@ts-ignore
    if (this.webRtcEndpoint && this.webRtcEndpoint.release) {
      //@ts-ignore
      this.webRtcEndpoint.release();
    }

    //@ts-ignore
    if (this.pipeline && this.pipeline.release) {
      //@ts-ignore
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

  static assignWebSocket(socket) {
    socket
      .setHandler('media/offer', (session, data) => {
        session.createMedia(data);
      })
      .setHandler('media/localCandidate', (session, data) => {
        /** @type {MediaClass} */
        const media = session.media;
        if (media && media.addWebRtcEndpointCandidates) {
          media.addWebRtcEndpointCandidates(data);
        }
        console.log(`local ${green(data.candidate)}`);
      })
      .setHandler('media/stop', (session) => {
        if (session.media && session.media.stop) {
          session.media.stop();
        }
      })
      .setHandler('media/mirror', (session) => {
        session.media.mirror();
      })
      .setHandler('media/record-start', async (session) => {
        const recordUrl = `http://${config.get('recordIp')}:${config.get('httpPort')}/${config.get('recordEndpoint')}`;
        /** @type {MediaClass} */
        const media = session.media;
        if (media && media.createRecordEndpoint) {
          media.recordEndpoint = await media.createRecordEndpoint(media.webRtcEndpoint, recordUrl, 'stream_');
        }
      })
      .setHandler('media/record-start-tofile', async (session) => {
        const fileRecordUrl = `file://${config.get('kurentoFilesPath')}`;
        /** @type {MediaClass} */
        const media = session.media;
        if (media && media.createRecordEndpoint) {
          media.fileRecordEndpoint = await media.createRecordEndpoint(media.webRtcEndpoint, fileRecordUrl, 'file_');
        }
      })
      .setHandler('media/record-stop', (session) => {
        /** @type {MediaClass} */
        const media = session.media;
        if (media && media.stopRecord) {
          if (media.recordEndpoint) {
            media.stopRecord(media.recordEndpoint);
          }
          if (media.fileRecordEndpoint) {
            media.stopRecord(media.fileRecordEndpoint);
          }
        }
      });

  }
}

/** @type {KurentoClient} */
MediaClass.client = null;

module.exports = { MediaClass };
