import { socket } from './web-socket';
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
    this.listenSocket();
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
    this.listenCandidates();
    socket.sendData('media/offer', this.offer);
    return true;
  }

  async stop() {
    if (socket.socket.OPEN) {
      socket.sendData('media/stop', '');
    } else {
      this.webRtcPeer.dispose();
      this.webRtcPeer = null;
    }
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
    return new Promise((resolve, reject) => {
      /** @type {WebRtcPeerSendrecv} */
      this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, function (error) {
        if (error) {
          reject(error);
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
      socket.sendData('media/mirror');
      this.lock.play = false;
    });

    socket.setHandler('media/event', (event) => {
      delete event.tags;
      delete event.timestamp;
      delete event.componentId;
      delete event.streamId;
      delete event.padName;
      console.log({ [event.type]: event });
    });

    socket.setHandler('media/record-started', (fileName) => {
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

  toggleRecord() {
    if (!this.webRtcPeer) {
      return false;
    }

    if (!this.isRecording) {
      // start record
      socket.sendData('media/record-start');
    } else {
      // stop record
      socket.sendData('media/record-stop');
      ui.set('recordStatus', '');
      ui.toggleRecBorder();
      files.refresh();
      this.isRecording = false;
    }
  }


}
