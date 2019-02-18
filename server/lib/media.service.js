//@ts-check
const KurentoClient = require('kurento-client');

const { MediaLayer } = require('./media.layer.');
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
    (async () => {
      this.client = await MediaLayer.createClient(config.kurentoWsUri);
      this.pipeline = await MediaLayer.createPipeline(this.client);
    })();
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
        case 'media/startRecord':
          this.onStartRecord();
          break;
        case 'media/stopRecord':
          this.onStopRecord();
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

    this.answer = await MediaLayer.getAnswer(this.webRtcEndpoint, offer);
    this.sendData('media/sdpAnswer', { sdpAnswer: this.answer });
    await MediaLayer.connectEndpoints(this.webRtcEndpoint, this.webRtcEndpoint);
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

  async onStartRecord() {
    const filename = MediaLayer.generateBaseRecordName();
    this.recorderEndpoint = await MediaLayer.createRecorderEndpoint(this.pipeline, `${config.recordEndpoint + filename}.mp4`);
    //@ts-ignore
    const uri = await this.recorderEndpoint.getUri();
    console.log(uri);

    //@ts-ignore
    this.recorderEndpoint.on('Recording', async () => {
      logger.log(`${MEDIA} recording started "${uri}"`);
      this.sendData('media/recordStarted', { uri });
    });

    //@ts-ignore
    this.recorderEndpoint.on('Stopped', async () => {
      logger.log(`MEDIA record stopped "${uri}"`);
      this.sendData('media/recordStopped', { uri });
    });
    await MediaLayer.connectEndpoints(this.webRtcEndpoint, this.recorderEndpoint);
    //@ts-ignore
    this.recorderEndpoint.record(error => error && logger.error(error));
    //@ts-ignore
  }

  onStopRecord() {
    if (!this.recorderEndpoint) {
      return;
    }
    //@ts-ignore
    this.recorderEndpoint.stop(error => error && logger.error(error));
    this.recorderEndpoint = null;
  }

}

module.exports.MediaService = MediaService;
