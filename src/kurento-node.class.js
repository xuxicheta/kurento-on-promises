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
    this.lock = {
      record: false,
      play: false,
    };
  }

  async start() {
    console.log('kurento constructor');
    this.lock.play = true;
    this.webRtcPeer = null;
    this.localCandidates = [];
    this.remoteCandidates = [];
    this.offer = '';
    this.answer = '';
    this.isRecording = undefined;
    this.isPlaying = true;

    this.options = this.createOptions('relay');

    this.offer = await this.generateOffer(this.options);
    this.listenSocket();
    this.listenCandidates();
    socket.sendData('media/offer', this.offer);
    return true;
  }

  async stop() {
    socket.sendData('media/stop', '');
    this.isPlaying = false;
    return true;
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
          ui.logAppend('sdp', 'offer generated');
          resolve(offer);
        });
      });
    });

  }

  listenCandidates() {
    this.webRtcPeer.on('icecandidate', (event) => {
      this.localCandidates.push(event);
      socket.sendData('media/localCandidate', event);
    });


  }

  listenSocket() {
    socket.setHandler('media/remoteCandidate', (data) => {
      this.remoteCandidates.push(data);
      if (this.webRtcPeer) {
        this.webRtcPeer.addIceCandidate(data);
      }
    });

    socket.setHandler('media/answer', (answer) => {
      this.answer = answer;
      this.webRtcPeer.processAnswer(this.answer);
      ui.logAppend('sdp', 'answer processed');
      console.log('answer processed');
      this.lock.play = false;
    });

    socket.setHandler('media/event', (event) => {
      console.log({ [event.type]: event });
    });

    socket.setHandler('media/recordStarted', (fileName) => {
      ui.set('recordStatus', `Recording ${fileName}`);
      ui.toggleRecBorder();
      this.lock.record = false;
      this.isRecording = true;
    });

    socket.setHandler('media/stopped', () => {
      if (this.webRtcPeer) {
        this.webRtcPeer.dispose();
        this.webRtcPeer = null;
      }
      ui.set('recordStatus', '');
      ui.logAppend('media', 'stopped');
      this.lock.play = false;
    });
  }

  onError(error) {
    console.error(error);
  }

  startRecord() {
    socket.sendData('media/startRecord');
  }

  stopRecord() {
    socket.sendData('media/stopRecord');
    ui.set('recordStatus', '');
    ui.toggleRecBorder();
    files.refresh();
    this.isRecording = false;
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
  }


}
