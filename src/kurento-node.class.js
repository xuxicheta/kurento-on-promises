import { socket } from './web-socket.service';

const kurentoUtils = window.kurentoUtils;

export class KurentoNode {
  constructor({
    videoInput,
    videoOutput,
  }) {
    console.log('kurento constructor');

    this.webRtcPeer = null;
    this.webRtcEndpoint = null;
    this.recorderEndpoint = null;
    this.pipeline = null;
    this.localCandidates = [];
    this.remoteCandidates = [];
    this.offer = '';
    this.answer = '';

    this.videoInput = videoInput;
    this.videoOutput = videoOutput;

    this.options = this.createOptions('relay');
    this.createPipeline();
  }

  createOptions(iceTransportPolicy) {
    return {
      localVideo: this.videoInput,
      remoteVideo: this.videoOutput,
      iceTransportPolicy,
    };
  }

  /**
   *
   * @param {*} options
   * @returns {Promise<string>}
   */
  generateOffer(options) {
    const _this = this;
    return new Promise((resolve, reject) => {
      /** @type {WebRtcPeerSendrecv} */
      this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, function (error) {
        if (error) {
          return _this.onError(error);
        }

        this.generateOffer((errorOffer, offer) => {
          if (errorOffer) {
            reject(errorOffer);
          }
          resolve(offer);
        });
      });
    });

  }

  listenCandidates() {
    this.webRtcPeer.on('icecandidate', (event) => {
      this.localCandidates.push(event);
      socket.send('media/localCandidate', event);
    });


  }

  async createPipeline() {
    this.offer = await this.generateOffer(this.options);
    this.listenSocket();
    this.listenCandidates();
    socket.send('media/offer', this.offer);
  }

  listenSocket() {
    socket.clearHandlers('media/remoteCandidate');
    socket.addHandler('media/remoteCandidate', (data) => {
      this.remoteCandidates.push(data);
      if (this.webRtcPeer) {
        this.webRtcPeer.addIceCandidate(data);
      }
    });

    socket.clearHandlers('media/answer');
    socket.addHandler('media/answer', (answer) => {
      this.answer = answer;
      this.webRtcPeer.processAnswer(this.answer);
      console.log('answer processed');
    });
  }

  onError(error) {
    console.error(error);
  }


}
