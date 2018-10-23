const KurentoClient = require('kurento-client');
const { MediaPipeline } = require('kurento-client-core'); // eslint-disable-line
const { WebRtcEndpoint, RecorderEndpoint } = require('kurento-client-elements'); // eslint-disable-line
const { config } = require('./config.module');
const { socket } = require('./web-socket.module');

class MediaModule {
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
    this.candidatesQueue = [];
    this.ws = ws;
    this.offer = offer;
    this.answer = '';
    this.STUN = '';
    this.TURN = '';
    this.pairs = null;
    this.init();
  }

  async init() {
    //@ts-ignore
    this.client = await KurentoClient(config.get('wsUri'));
    console.log('client ready');

    this.pipeline = await this.client.create('MediaPipeline');
    console.log('pipeline ready');

    this.webRtcEndpoint = await this.pipeline.create('WebRtcEndpoint');
    console.log('webrtc endpoint ready');

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
    this.webRtcEndpoint.gatherCandidates(this.onError);
    //@ts-ignore
    await this.webRtcEndpoint.connect(this.webRtcEndpoint);

    //@ts-ignore
    this.STUN = await this.webRtcEndpoint.getStunServerAddress();
    //@ts-ignore
    this.TURN = await this.webRtcEndpoint.getTurnUrl();
    //@ts-ignore
    this.pairs = await this.webRtcEndpoint.getICECandidatePairs();
    console.log(this);


  }

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

  async createRecord() {
    if (this.client) {
      const strTime = new Date().toLocaleString().replace(' ', '_');
      this.recordEndpoint = await this.pipeline.create('RecorderEndpoint', {
        uri: `file:///tmp/${strTime}.mp4`,
      });
      await this.webRtcEndpoint.connect(this.recordEndpoint);
      console.log('record endpoint ready', 'file here', await this.recordEndpoint.getUri());

      this.recordEndpoint.record();
      this.ws.sendData('media/recordStarted', await this.recordEndpoint.getUri());
    }
  }

  async stopRecord() {
    if (this.recordEndpoint) {
      this.recordEndpoint.release();
    }
  }

  async stop() {
    console.log('stopped');

    if (this.recorderEndpoint) {
      this.recorderEndpoint.release();
    }
    if (this.webRtcEndpoint) {
      this.webRtcEndpoint.release();
    }
    if (this.pipeline) {
      this.pipeline.release();
    }
    this.ws.sendData('media/stopped', '');
  }

  onError(error) {
    console.error(error);
  }
}

socket.addHandler('media/offer', (data, ws) => {
  ws.media = new MediaModule(ws, data);
});

socket.addHandler('media/localCandidate', (data, ws) => {
  /** @type {MediaModule} */
  const media = ws.media;
  if (media && media.addWebRtcEndpointCandidates) {
    media.addWebRtcEndpointCandidates(data);
  }
});

socket.addHandler('media/stop', (data, ws) => {
  /** @type {MediaModule} */
  const media = ws.media;
  if (media && media.stop) {
    media.stop();
  }
});

socket.addHandler('media/startRecord', (data, ws) => {
  /** @type {MediaModule} */
  const media = ws.media;
  if (media && media.createRecord) {
    media.createRecord();
  }
});

socket.addHandler('media/stopRecord', (data, ws) => {
  /** @type {MediaModule} */
  const media = ws.media;
  if (media && media.stopRecord) {
    media.stopRecord();
  }
});


// module.exports.media = media;
module.exports.Media = MediaModule;
