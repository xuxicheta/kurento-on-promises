//@ts-check
const KurentoClient = require('kurento-client');

const { MediaLayer } = require('./media-layer.util');
const { config } = require('../config');
const logger = require('../modules/logger/logger.module');
const MEDIA = logger.color.magenta('MEDIA');

class MediaService {

  constructor({ sendData }) {
    /** @type {(method: string, params?: any) => void} */
    this.sendData = sendData;
    this.client = null;
    /** @type {import('kurento-client-core').MediaPipeline} */
    this.pipeline = null;
    /** @type {import('kurento-client-elements').WebRtcEndpoint} */
    this.webRtcEndpoint = null;
    /** @type {import('kurento-client-elements').RecorderEndpoint} */
    this.recorderEndpoint = null;
    /** @type {import('kurento-client-elements').RecorderEndpoint} */
    this.fileRecordEndpoint = null;

    this.candidatesQueue = [];
    this.offer = null;
    this.answer = null;
    this.init();
  }

  /**
   * @param {import('./web-socket.unit').MessageData} messageData
   */
  onMediaMessageData(messageData) {
    switch (messageData.method) {
      case 'media/getIceServers':
        this.sendData('media/iceServers', config.iceServers);
        break;
      case 'media/offer':
        this.onOffer(messageData.params.offer);
        break;
      case 'media/localCandidate':
        this.onLocalCandidate(messageData.params.candidate);
        break;
      case 'media/stop':
        this.onStop();
        break;
      default:
    }
  }

  onOffer(offer) {
    this.offer = offer;
    MediaLayer.getAnswer(this.webRtcEndpoint, offer)
      .then((answer) => {
        this.answer = answer;
        this.sendData('media/answer', { answer });
      });
  }

  /**
   * @async
   */
  async init() {

    this.client = await MediaLayer.createClient(config.kurentoWsUri);
    this.pipeline = await MediaLayer.createPipeline(this.client);

    this.webRtcEndpoint = await MediaLayer.createWebRtcEndpoint(this.pipeline);
    while (this.candidatesQueue.length) {
      this.webRtcEndpoint.addIceCandidate(this.candidatesQueue.shift(), () => { });
    }

    //@ts-ignore
    this.webRtcEndpoint.on('OnIceCandidate', (event) => {
      //@ts-ignore
      const candidate = KurentoClient.getComplexType('IceCandidate')(event.candidate);
      this.sendData('media/remoteCandidate', candidate);
    });

    const filename = MediaLayer.generateBaseRecordName();
    this.recorderEndpoint = await MediaLayer.createRecorderEndpoint(this.pipeline, config.recordEndpoint + filename);
    //@ts-ignore
    this.recorderEndpoint.on('Recording', async () => {
      //@ts-ignore
      logger.log(`${MEDIA} recording started "${await this.recorderEndpoint.getUri()}"`);
      this.sendData('media/record-started');
    });

    //@ts-ignore
    this.recorderEndpoint.on('Stopped', async () => {
      //@ts-ignore
      logger.log(`MEDIA record stopped "${await this.recorderEndpoint.getUri()}"`);
    });
  }

  setDebugListeners() {
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
      this.webRtcEndpoint.on(eventName, (event) => {
        logger.log(eventName, JSON.stringify(event));
      });
    });
  }

  onLocalCandidate(data) {
    //@ts-ignore
    const candidate = KurentoClient.getComplexType('IceCandidate')(data);
    if (this.webRtcEndpoint) {
      //@ts-ignore
      this.webRtcEndpoint.addIceCandidate(candidate);
    } else {
      this.candidatesQueue.push(candidate);
    }
  }

  onStop() {
    MediaLayer.stopEndpoint(this.recorderEndpoint);
  }

}

module.exports.MediaService = MediaService;
