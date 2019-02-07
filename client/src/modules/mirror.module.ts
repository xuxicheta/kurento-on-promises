
import { KurentoWrapper, WebRtcPeerOptions } from '../lib/kurento-wrapper';
import { WebRtcPeer } from 'kurento-utils';
import { WebSocketModule } from './web-socket.module';
import { EventEmitter } from 'events';

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

  private ws: WebSocketModule;

  private webRtcPeer: WebRtcPeer = null;


  constructor(ws: WebSocketModule) {
    super();
    this.mirrorPlayButton.addEventListener('click', () => this.onPlayClick());
    this.mirrorRecordingButton.addEventListener('click', () => this.onRecordingClick());
    this.ws = ws;
    this.ws
      .on('media/iceServers', (iceServersJSON: string) => {
        this.setIceServers(JSON.parse(iceServersJSON));
      })
      .on('media/sdpAnswer', (evt: {sdpAnswer: string}) => {
        this.onAnswer(evt.sdpAnswer);
      })
      .on('media/remoteCandidate', (evt: { candidate: any}) => {
        this.onRemoteCandidate(evt.candidate);
      })
    this.ws.sendData('media/getIceServers');
  }

  setIceServers(iceServers: any[]) {
    this.iceServers = iceServers;
  }

  async onAnswer(sdpAnswer: string) {
    await KurentoWrapper.processAnswer(this.webRtcPeer, sdpAnswer);
    this.emit('playStatus', true);
  }

  onRemoteCandidate(candidate: RTCIceCandidate) {
    KurentoWrapper.addIceCandidate(this.webRtcPeer, candidate);
  }

  async onPlayClick() {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.mirrorPlayButton.value = 'Play';
      this.mirrorPlayButton.classList.remove('active');
      this.webRtcPeer.dispose();
      this.webRtcPeer = null;
      this.ws.sendData('media/clientStop');
      this.emit('playStatus', false);
    } else {
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

      this.ws.sendData('media/sdpOffer', { sdpOffer: this.sdpOffer });
    }
  }

  onRecordingClick() {
    if (!this.isPlaying) {
      return;
    }

    if (!this.isRecordOn) {
      this.ws.sendData('media/startRecord');
      this.mirrorRecordingButton.value = 'Stop Rec';
      this.isRecordOn = true;
    } else {
      this.ws.sendData('media/stopRecord');
      this.mirrorRecordingButton.value = 'Start Rec'
      this.isRecordOn = false;
    }


  }

  onCandidate(candidate: any) {
    this.ws.sendData('media/localCandidate', { candidate });
  }
}
