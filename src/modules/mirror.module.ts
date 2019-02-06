
import { KurentoWrapper, WebRtcPeer } from '../lib/kurento-wrapper';

export class MirorModule {
  private mirrorPlayButton: HTMLInputElement = <HTMLInputElement>document.getElementById('mirror-play-button');
  private mirrorRecordingButton: HTMLInputElement = <HTMLInputElement>document.getElementById('mirror-recording-button');
  private localVideo: HTMLVideoElement = <HTMLVideoElement>document.getElementById('mirror-localVideo');
  private remoteVideo: HTMLVideoElement = <HTMLVideoElement>document.getElementById('mirror-remoteVideo');

  private isPlaying = false;
  private isRecording = false;
  private isRecordEnabled = false;

  webRtcPeer: WebRtcPeer = null;

  constructor() {
    this.mirrorPlayButton.addEventListener('click', () => this.onPlayClick());
  }

  async onPlayClick() {
    this.webRtcPeer = await KurentoWrapper.createWebRtcPeer({
      localVideo: this.localVideo,
    });
  }
}
