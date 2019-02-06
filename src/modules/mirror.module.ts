
import { KurentoWrapper, WebRtcPeer, WebRtcPeerOptions } from '../lib/kurento-wrapper';
import { WebSocketModule } from './web-socket.module';

export class MirrorModule {
  private mirrorPlayButton: HTMLInputElement = <HTMLInputElement>document.getElementById('mirror-play-button');
  private mirrorRecordingButton: HTMLInputElement = <HTMLInputElement>document.getElementById('mirror-recording-button');
  private localVideo: HTMLVideoElement = <HTMLVideoElement>document.getElementById('mirror-localVideo');
  private remoteVideo: HTMLVideoElement = <HTMLVideoElement>document.getElementById('mirror-remoteVideo');

  private isPlaying = false;
  private isRecording = false;
  private isRecordEnabled = false;
  private iceServers: any[];

  private ws: WebSocketModule;

  webRtcPeer: WebRtcPeer = null;


  constructor(ws: WebSocketModule) {
    this.mirrorPlayButton.addEventListener('click', () => this.onPlayClick());
    this.ws = ws;
    this.ws.on('media/iceServers', (evt: CustomEvent) => {
      this.setIceServers(JSON.parse(evt.detail));
    });
    this.ws.sendData('media/getIceServers');
  }

  setIceServers(iceServers: any[]) {
    this.iceServers = iceServers;
  }

  async onPlayClick() {
    this.webRtcPeer = await KurentoWrapper.createWebRtcPeer({
      localVideo: this.localVideo,
      remoteVideo: this.remoteVideo,
      onicecandidate: (candidate: any) => this.onCandidate(candidate),
      configuration: {
        iceServers: this.iceServers,
      }
    });
  }

  onCandidate(candidate: any) {

  }
}
