const KurentoClient = require('kurento-client');
// const { MediaPipeline } = require('kurento-client-core'); // eslint-disable-line
// const { WebRtcEndpoint, RecorderEndpoint } = require('kurento-client-elements'); // eslint-disable-line
const config = require('./config.lib');
const socket = require('./web-socket.lib');


class MediaClass {
  /**
   *
   * @param {WebSocket} ws
   * @param {string} offer
   */
  constructor(ws, offer) {
    this.wsUri = config.get('wsUri');
    this.client = null;
    /** @type {MediaPipeline} */
    this.pipeline = null;
    /** @type {WebRtcEndpoint} */
    this.webRtcEndpoint = null;
    /** @type {RecorderEndpoint} */
    this.recordEndpoint = null;
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
    this.client = await KurentoClient(this.wsUri);
    console.log('MEDIA created client');

    this.pipeline = await this.client.create('MediaPipeline');
    console.log(`MEDIA created pipeline ${this.pipeline.id}`);

    this.webRtcEndpoint = await this.pipeline.create('WebRtcEndpoint');
    console.log(`MEDIA created webRtcEndpoint ${this.webRtcEndpoint.id}`);

    while (this.candidatesQueue.length) {
      this.webRtcEndpoint.addIceCandidate(this.candidatesQueue.shift(), () => { });
    }
    this.setDebugListeners(this.webRtcEndpoint);
    this.sendCandidatesToClient();
    //@ts-ignore
    this.answer = await this.webRtcEndpoint.processOffer(this.offer);
    this.ws.send(JSON.stringify({
      type: 'media/answer',
      data: this.answer,
    }));
    this.webRtcEndpoint.gatherCandidates((error) => {
      if (error) {
        console.error();
      }
    });
    //@ts-ignore
    await this.webRtcEndpoint.connect(this.webRtcEndpoint);

    //@ts-ignore
    this.STUN = await this.webRtcEndpoint.getStunServerAddress();
    //@ts-ignore
    this.TURN = await this.webRtcEndpoint.getTurnUrl();
    //@ts-ignore
    /** @type {any[]} */
    this.pairs = await this.webRtcEndpoint.getICECandidatePairs();
    this.pairs.forEach((pair) => {
      console.log(`MEDIA pair local ${pair.localCandidate}`);
      console.log(`MEDIA pair remote ${pair.remoteCandidate}`);
    });
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
      'IceCandidateFound',
      'IceComponentStateChange',
      'IceGatheringDone',
      'NewCandidatePairSelected',
      'OnDataChannelClosed',
      'OnDataChannelOpened',
      'OnIceCandidate',
      'OnIceComponentStateChanged',
      'OnIceGatheringDone',
      // BaseEndpoint events
      'ConnectionStateChanged',
      'MediaStateChanged',
    ];

    eventsArray.forEach((eventName) => {
      webRtcEndpoint.on(eventName, (event) => {
        this.ws.sendData('media/event', event);
      });
    });


  }

  sendCandidatesToClient() {
    this.webRtcEndpoint.on('OnIceCandidate', (event) => {
      const candidate = KurentoClient.getComplexType('IceCandidate')(event.candidate);
      this.ws.sendData('media/remoteCandidate', candidate);
    });
  }

  addWebRtcEndpointCandidates(data) {
    const candidate = KurentoClient.getComplexType('IceCandidate')(data);
    if (this.webRtcEndpoint) {
      this.webRtcEndpoint.addIceCandidate(candidate);
    } else {
      this.candidatesQueue.push(candidate);
      // console.log('queued');
    }
  }

  /**
   * @async
   */
  async createRecord() {
    const recordUrl = `${config.get('recordProtocol')}://${config.get('recordIp')}:${config.get('recordPort')}/${config.get('recordPath')}`;

    if (this.client) {
      const strTime = new Date().toLocaleString().replace(' ', '_');
      this.recordEndpoint = await this.pipeline.create('RecorderEndpoint', {
        uri: `${recordUrl}/${strTime}.mp4`,
      });
      await this.webRtcEndpoint.connect(this.recordEndpoint);
      console.log(`MEDIA record file here "${await this.recordEndpoint.getUri()}"`);

      this.recordEndpoint.record();
      this.ws.sendData('media/recordStarted', await this.recordEndpoint.getUri());
    }
  }

  /**
   * @async
   */
  async stopRecord() {
    if (this.recordEndpoint && this.recordEndpoint.getUri) {
      console.log(`MEDIA record "${await this.recordEndpoint.getUri()}" stopped`);
      return this.recordEndpoint.release();
    }
  }

  /**
   * @async
   */
  async stop() {
    console.log('stopped');

    if (this.recorderEndpoint && this.recordEndpoint.release) {
      this.recorderEndpoint.release();
    }
    if (this.webRtcEndpoint && this.webRtcEndpoint.release) {
      this.webRtcEndpoint.release();
    }
    if (this.pipeline && this.pipeline.release) {
      this.pipeline.release();
    }
    this.ws.sendData('media/stopped', '');
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
      })
      .setHandler('media/stop', (data, ws) => {
        /** @type {MediaClass} */
        const media = ws.media;
        if (media && media.stop) {
          media.stop();
        }
      })
      .setHandler('media/startRecord', (data, ws) => {
        /** @type {MediaClass} */
        const media = ws.media;
        if (media && media.createRecord) {
          media.createRecord();
        }
      })
      .setHandler('media/stopRecord', (data, ws) => {
        /** @type {MediaClass} */
        const media = ws.media;
        if (media && media.stopRecord) {
          media.stopRecord();
        }
      });
  }
}

module.exports = { MediaClass };
