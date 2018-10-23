import { socket } from './web-socket.service';
import { ui } from './ui';
import { files } from './files';

const kurentoUtils = window.kurentoUtils;

export class KurentoNode {
  constructor({
    videoInput,
    videoOutput,
  }) {
    this.videoInput = videoInput;
    this.videoOutput = videoOutput;
  }

  async start() {
    console.log('kurento constructor');

    this.webRtcPeer = null;
    this.localCandidates = [];
    this.remoteCandidates = [];
    this.offer = '';
    this.answer = '';
    this.isRecording = undefined;

    this.options = this.createOptions('relay');

    this.offer = await this.generateOffer(this.options);
    this.listenSocket();
    this.listenCandidates();
    socket.send('media/offer', this.offer);
  }

  async stop() {
    socket.send('media/stop', '');
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

    socket.clearHandlers('media/event');
    socket.addHandler('media/event', (event) => {
      console.log({ [event.type]: event });
    });

    socket.clearHandlers('media/recordStarted');
    socket.addHandler('media/recordStarted', (fileName) => {
      ui.set('recordButton', `Recording ${fileName}`);
    });

    socket.addHandler('media/stopped', () => {
      if (this.webRtcPeer) {
        this.webRtcPeer.dispose();
        this.webRtcPeer = null;
      }
      ui.reset('recordButton');
    });
  }

  onError(error) {
    console.error(error);
  }

  startRecord() {
    socket.send('media/startRecord');
  }

  stopRecord() {
    socket.send('media/stopRecord');
    files.refresh();
  }

  toggleRecord() {
    if (!this.webRtcPeer) {
      return false;
    }

    if (!this.isRecording) {
      this.startRecord();
    } else {
      this.stopRecord();
    }
    this.isRecording = !this.isRecording;
  }


}
