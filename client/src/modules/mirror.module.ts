
import { KurentoWrapper } from '../lib/kurento-wrapper';
import { WebRtcPeer } from 'kurento-utils';
import { WebSocketUnit } from './web-socket.unit';
import { EventEmitter } from 'events';
import { storage, STORAGE } from '../lib/storage.module';

export class MirrorModule extends EventEmitter {
  private mirrorPlayButton: HTMLInputElement = document.getElementById('mirror-play-button') as HTMLInputElement;
  private mirrorRecordingButton: HTMLInputElement = document.getElementById('mirror-recording-button') as HTMLInputElement;
  private localVideo: HTMLVideoElement = document.getElementById('mirror-localVideo') as HTMLVideoElement;
  private remoteVideo: HTMLVideoElement = document.getElementById('mirror-remoteVideo') as HTMLVideoElement;

  private sdpOffer: string;
  private sdpAnswer: string;
  private isPlaying = false;
  private isRecording = false;
  private isRecordOn = false;
  private iceServers: any[] = [];
  private isIceServersGot: Promise<void>;

  private webSocketUnit: WebSocketUnit;

  private webRtcPeer: WebRtcPeer = null;


  constructor(webSocketModule: WebSocketUnit) {
    super();
    this.mirrorPlayButton.addEventListener('click', () => this.onPlayClick());
    this.mirrorRecordingButton.addEventListener('click', () => this.onRecordingClick());
    this.webSocketUnit = webSocketModule;
    this.webSocketUnit
      .on('media/iceServers', (iceServersJSON: string) => {
        this.setIceServers(JSON.parse(iceServersJSON));
        this.emit('iceServersGot');
      })
      .on('media/sdpAnswer', (evt: { sdpAnswer: string }) => {
        this.onAnswer(evt.sdpAnswer);
      })
      .on('media/remoteCandidate', (evt: { candidate: any }) => {
        this.onRemoteCandidate(evt.candidate);
      })
      .on('media/recordStarted', (evt: { uri: string }) => {
        this.mirrorRecordingButton.classList.add('active');
        storage.setItem(STORAGE.RECORDING, evt.uri);
        this.isRecording = true;
      })
      .on('media/recordStopped', (evt: { uri: string }) => {
        this.mirrorRecordingButton.classList.remove('active');
        storage.removeItem(STORAGE.RECORDING);
        this.isRecording = false;
      })
      .on('media/pair', (evt) => {
        const localCandidate = evt.candidatePair.localCandidate.split(' ');
        (document.querySelector('#localCandidate') as HTMLDivElement).innerText = `protocol: ${localCandidate[2]}, IP: ${localCandidate[4]}, port: ${localCandidate[5]}`;
        const remoteCandidate = evt.candidatePair.remoteCandidate.split(' ');
        (document.querySelector('#remoteCandidate') as HTMLDivElement).innerText = `protocol: ${remoteCandidate[2]}, IP: ${remoteCandidate[4]}, port: ${remoteCandidate[5]}`;
      });
    this.isIceServersGot = new Promise((resolve, reject) => {
      this.on('iceServersGot', () => resolve());
    });

    if (storage.getItem(STORAGE.PLAYING)) {
      this.play(true).then(() => {
        if (storage.getItem(STORAGE.RECORDING)) {
          this.startRecord(true);
        }
      });
      
    }
  }

  setIceServers(iceServers: any[]) {
    this.iceServers = iceServers;
  }

  async onAnswer(sdpAnswer: string) {
    const peerConnection: RTCPeerConnection = this.webRtcPeer.peerConnection;
    peerConnection.addEventListener('connectionstatechange', evt => console.log('connectionstatechange', evt));
    peerConnection.addEventListener('datachannel', evt => console.log('datachannel', evt));
    peerConnection.addEventListener('icecandidate', evt => console.log('icecandidate', evt));
    peerConnection.addEventListener('icecandidateerror', evt => console.log('icecandidateerror', evt));
    peerConnection.addEventListener('iceconnectionstatechange', evt => console.log('iceconnectionstatechange', evt));
    peerConnection.addEventListener('icegatheringstatechange', evt => console.log('icegatheringstatechange', evt));
    peerConnection.addEventListener('negotiationneeded', evt => console.log('negotiationneeded', evt));
    peerConnection.addEventListener('signalingstatechange', evt => console.log('signalingstatechange', evt));
    peerConnection.addEventListener('statsended', evt => console.log('statsended', peerConnection.getStats().then(stats => console.log('stats', stats))));
    peerConnection.addEventListener('track', evt => console.log('track', evt));

    console.log(this.webRtcPeer);

    await KurentoWrapper.processAnswer(this.webRtcPeer, sdpAnswer);
    this.emit('playStatus', true);
  }

  onRemoteCandidate(candidate: RTCIceCandidate) {
    KurentoWrapper.addIceCandidate(this.webRtcPeer, candidate);
  }

  async onPlayClick() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play(false);
    }
  }

  stop() {
    if (!this.isPlaying) {
      return;
    }
    this.isPlaying = false;
    this.mirrorPlayButton.value = 'Play';
    this.mirrorPlayButton.classList.remove('active');
    this.webRtcPeer.dispose();
    this.webRtcPeer = null;
    this.webSocketUnit.sendData('media/clientStop');
    storage.removeItem(STORAGE.PLAYING);
    this.emit('playStatus', false);
  }

  async play(isResumePlay: boolean) {
    if (this.isPlaying) {
      return;
    }
    this.webSocketUnit.sendData('media/getIceServers');
    await this.isIceServersGot;
    this.webRtcPeer = await KurentoWrapper.createWebRtcPeer({
      localVideo: this.localVideo,
      remoteVideo: this.remoteVideo,
      onicecandidate: (candidate: any) => this.onCandidate(candidate),
      configuration: {
        iceServers: this.iceServers,
      }
    });
    this.sdpOffer = await KurentoWrapper.generateOffer(this.webRtcPeer);
    this.isPlaying = true;
    this.mirrorPlayButton.value = 'Stop';
    this.mirrorPlayButton.classList.add('active');

    this.webSocketUnit.sendData('media/sdpOffer', {
      sdpOffer: this.sdpOffer,
      isResumePlay,
    });
    // wait for connectionState will be connected
    await new Promise((resolve) => {
      this.webRtcPeer.peerConnection.addEventListener('connectionstatechange', () => {
        if (this.webRtcPeer.peerConnection.connectionState === 'connected') {
          resolve();
        }
      });
    });
    storage.setItem(STORAGE.PLAYING, new Date().toLocaleString());
  }

  onRecordingClick() {
    if (!this.isPlaying) {
      return;
    }

    if (!this.isRecordOn) {
      this.startRecord(false);
    } else {
      this.stopRecord();
    }
  }

  startRecord(isResumeRecord: boolean) {
    this.webSocketUnit.sendData('media/startRecord', { isResumeRecord });
    this.mirrorRecordingButton.value = 'Stop Rec';
    this.isRecordOn = true;
  }

  stopRecord() {
    this.webSocketUnit.sendData('media/stopRecord');
    this.mirrorRecordingButton.value = 'Start Rec'
    this.isRecordOn = false;
  }

  onCandidate(candidate: any) {
    this.webSocketUnit.sendData('media/localCandidate', { candidate });
  }
}
