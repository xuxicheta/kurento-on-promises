//@ts-check
const KurentoClient = require('kurento-client');

const { KurentoClientWrapper } = require('./kurento-client-wrapper');
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
    this.kurentoCandidates = [];
    (async () => {
      this.client = await KurentoClientWrapper.createClient(config.kurentoWsUri);
      this.pipeline = await KurentoClientWrapper.createPipeline(this.client);
    })();
  }

  /**
   * @param {import('./session.class').MessageData} messageData
   */
  onMediaMessageData(messageData) {
    try {
      switch (messageData.method) {
        case 'media/getIceServers':
          this.sendData('media/iceServers', config.iceServers);
          break;
        case 'media/sdpOffer':
          this.onOffer(messageData.params.sdpOffer, messageData.params.isResumePlay);
          break;
        case 'media/localCandidate':
          this.onLocalCandidate(messageData.params.candidate);
          break;
        case 'media/clientStop':
          this.onStop();
          break;
        case 'media/startRecord':
          this.onStartRecord(messageData.params.isResumeRecord);
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

  /**
   * @param {string} sdpOffer
   * @param {boolean} isResumePlay
   */
  async onOffer(sdpOffer, isResumePlay) {
    const isResume = isResumePlay && Boolean(this.webRtcEndpoint);
    const oldWebRtcEndpoint = this.webRtcEndpoint;
    this.webRtcEndpoint = null;
    this.offer = sdpOffer;

    if (isResume) {
      if (this.recorderEndpoint) {
        logger.log(MEDIA, 'disconnect from existing recorderEndpoint');
        await KurentoClientWrapper.pauseEndpoint(this.recorderEndpoint);
        await KurentoClientWrapper.disconnectEndpoints(oldWebRtcEndpoint, this.recorderEndpoint);
      }
      logger.log(MEDIA, 'release previous webRtcEndpoint');
      await KurentoClientWrapper.releaseEndpoint(oldWebRtcEndpoint);
    }


    this.webRtcEndpoint = await KurentoClientWrapper.createWebRtcEndpoint(this.pipeline);
    KurentoClientWrapper.onEventEndpoint(this.webRtcEndpoint, 'OnIceCandidate', (event) => {
      //@ts-ignore
      const candidate = KurentoClient.getComplexType('IceCandidate')(event.candidate);
      this.sendData('media/remoteCandidate', { candidate });
    });

    KurentoClientWrapper.onEventEndpoint(this.webRtcEndpoint, 'NewCandidatePairSelected', (evt) => {
      logger.log(`${MEDIA} PAIR -------  -------  `);
      logger.log(`${MEDIA} local ${evt.candidatePair.localCandidate}`);
      logger.log(`${MEDIA} remote ${evt.candidatePair.remoteCandidate}`);
      this.sendData('media/pair', evt);
    });

    while (this.frozenCandidates.length) {
      this.webRtcEndpoint.addIceCandidate(this.frozenCandidates.shift(), () => { });
    }

    this.answer = await KurentoClientWrapper.getAnswer(this.webRtcEndpoint, sdpOffer);
    this.sendData('media/sdpAnswer', { sdpAnswer: this.answer });
    await KurentoClientWrapper.connectEndpoints(this.webRtcEndpoint, this.webRtcEndpoint);
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

  async onStop() {
    await KurentoClientWrapper.stopEndpoint(this.recorderEndpoint);
    await KurentoClientWrapper.releaseEndpoint(this.webRtcEndpoint);
    this.webRtcEndpoint = null;
  }

  /**
   * @param {boolean} isResumeRecord
   */
  async onStartRecord(isResumeRecord) {
    const isResume = isResumeRecord && Boolean(this.recorderEndpoint);
    if (!isResume) {
      const filename = KurentoClientWrapper.generateBaseRecordName();
      this.recorderEndpoint = await KurentoClientWrapper.createRecorderEndpoint(this.pipeline, `${config.recordEndpoint + filename}.mp4`);
      //@ts-ignore
      const uri = await this.recorderEndpoint.getUri();

      KurentoClientWrapper.onEventEndpoint(this.recorderEndpoint, 'Recording', () => {
        logger.log(`${MEDIA} recording started "${uri}"`);
        this.sendData('media/recordStarted', { uri });
      });

      KurentoClientWrapper.onEventEndpoint(this.recorderEndpoint, 'Stopped', () => {
        logger.log(`${MEDIA} record stopped "${uri}"`);
        this.sendData('media/recordStopped', { uri });
      });
    }
    await KurentoClientWrapper.connectEndpoints(this.webRtcEndpoint, this.recorderEndpoint);
    await KurentoClientWrapper.startRecord(this.recorderEndpoint);

    logger.log(`${MEDIA} starting record`);
  }

  async onStopRecord() {
    if (!this.recorderEndpoint) {
      return;
    }
    await KurentoClientWrapper.stopEndpoint(this.recorderEndpoint);
    this.recorderEndpoint = null;
  }
}

module.exports.MediaService = MediaService;
