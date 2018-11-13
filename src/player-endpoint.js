import { socket } from './web-socket';
import { ui } from './ui';

const kurentoUtils = window.kurentoUtils;

export class PlayerEndpoint {
  constructor({
    videoOutput,
  }) {
    this.videoOutput = videoOutput;
    this.listenSocket();
  }

  async start(url) {
    console.log('kurento constructor');
    this.url = url;
    this.webRtcPeer = null;
    this.localCandidates = [];
    this.remoteCandidates = [];
    this.offer = '';
    this.answer = '';
    this.isPlaying = true;

    this.options = this.createOptions('relay');

    this.offer = await this.generateOffer(this.options);
    this.listenCandidates();
    socket.sendData('player/offer', this.offer);
    return true;
  }

  async stop() {
    socket.sendData('player/stop', '');
    this.isPlaying = false;
    return true;
  }

  createOptions(iceTransportPolicy) {
    return {
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
          ui.logAppend('player', 'offer generated');
          resolve(offer);
        });
      });
    });
  }

  listenCandidates() {
    this.webRtcPeer.on('icecandidate', (event) => {
      this.localCandidates.push(event);
      socket.sendData('player/localCandidate', event);
    });
  }

  listenSocket() {
    socket
      .setHandler('player/remoteCandidate', (data) => {
      this.remoteCandidates.push(data);
      if (this.webRtcPeer) {
        this.webRtcPeer.addIceCandidate(data);
      }
    })
      .setHandler('player/file-found', (data) => {
        this.start(data);
      })

      .setHandler('player/answer', (answer) => {
        this.answer = answer;
        this.webRtcPeer.processAnswer(this.answer);
        ui.logAppend('player', 'answer processed');
        console.log('player answer processed');
        socket.sendData('player/play', this.url);
      })

      .setHandler('player/event', (event) => {
        delete event.tags;
        delete event.timestamp;
        delete event.componentId;
        delete event.streamId;
        delete event.padName;
        console.log({ [event.type]: event });
      })

      .setHandler('player/stopped', () => {
        if (this.webRtcPeer) {
          this.webRtcPeer.dispose();
          this.webRtcPeer = null;
        }
        ui.set('recordStatus', '');
        ui.logAppend('player', 'stopped');
        this.lock.play = false;
      });
  }

}
