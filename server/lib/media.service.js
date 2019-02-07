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

    this.frozenCandidates = [];
    this.offer = null;
    this.answer = null;
    this.init();
  }

  /**
   * @param {import('./web-socket.unit').MessageData} messageData
   */
  onMediaMessageData(messageData) {
    try {
      switch (messageData.method) {
        case 'media/getIceServers':
          this.sendData('media/iceServers', config.iceServers);
          break;
        case 'media/sdpOffer':
          this.onOffer(messageData.params.sdpOffer);
          break;
        case 'media/localCandidate':
          this.onLocalCandidate(messageData.params.candidate);
          break;
        case 'media/clientStop':
          this.onStop();
          break;
        default:
      }
    } catch (error) {
      logger.error(MEDIA, error);
    }
  }

  async onOffer(offer) {
    this.offer = offer;

    this.webRtcEndpoint = await MediaLayer.createWebRtcEndpoint(this.pipeline);
    while (this.frozenCandidates.length) {
      this.webRtcEndpoint.addIceCandidate(this.frozenCandidates.shift(), () => { });
    }

    //@ts-ignore
    this.webRtcEndpoint.on('OnIceCandidate', (event) => {
      //@ts-ignore
      const candidate = KurentoClient.getComplexType('IceCandidate')(event.candidate);
      this.sendData('media/remoteCandidate', { candidate });
    });

    // const filename = MediaLayer.generateBaseRecordName();
    // this.recorderEndpoint = await MediaLayer.createRecorderEndpoint(this.pipeline, config.recordEndpoint + filename);
    // //@ts-ignore
    // this.recorderEndpoint.on('Recording', async () => {
    //   //@ts-ignore
    //   logger.log(`${MEDIA} recording started "${await this.recorderEndpoint.getUri()}"`);
    //   this.sendData('media/record-started');
    // });

    // //@ts-ignore
    // this.recorderEndpoint.on('Stopped', async () => {
    //   //@ts-ignore
    //   logger.log(`MEDIA record stopped "${await this.recorderEndpoint.getUri()}"`);
    // });

    this.answer = await MediaLayer.getAnswer(this.webRtcEndpoint, offer)
    this.sendData('media/sdpAnswer', { sdpAnswer: this.answer });
    await MediaLayer.connectEndpoints(this.webRtcEndpoint, this.webRtcEndpoint);
    logger.log('connected');
  }

  /**
   * @async
   */
  async init() {

    this.client = await MediaLayer.createClient(config.kurentoWsUri);
    this.pipeline = await MediaLayer.createPipeline(this.client);


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
      this.frozenCandidates.push(candidate);
    }
  }

  onStop() {
    MediaLayer.stopEndpoint(this.recorderEndpoint);
    //@ts-ignore
    this.webRtcEndpoint.release(error => error && logger.error(error));
    this.webRtcEndpoint = null;
  }

}

module.exports.MediaService = MediaService;
