
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

  private webSocketModule: WebSocketModule;

  private webRtcPeer: WebRtcPeer = null;


  constructor(webSocketModule: WebSocketModule) {
    super();
    this.mirrorPlayButton.addEventListener('click', () => this.onPlayClick());
    this.mirrorRecordingButton.addEventListener('click', () => this.onRecordingClick());
    this.webSocketModule = webSocketModule;
    this.webSocketModule
      .on('media/iceServers', (iceServersJSON: string) => {
        this.setIceServers(JSON.parse(iceServersJSON));
      })
      .on('media/sdpAnswer', (evt: {sdpAnswer: string}) => {
        this.onAnswer(evt.sdpAnswer);
      })
      .on('media/remoteCandidate', (evt: { candidate: any}) => {
        this.onRemoteCandidate(evt.candidate);
      })
      .on('media/recordStarted', (evt: { uri: string }) => {
        this.mirrorRecordingButton.classList.add('active');
      })
      .on('media/recordStopped', (evt: { uri: string }) => {
        this.mirrorRecordingButton.classList.remove('active');
      });
    this.webSocketModule.sendData('media/getIceServers');
  }

  setIceServers(iceServers: any[]) {
    this.iceServers = iceServers;
  }

  async onAnswer(sdpAnswer: string) {
    this.webRtcPeer.peerConnection.onsignalingstatechange = evt => console.log('signalingState', (evt.target as RTCPeerConnection).signalingState);
    this.webRtcPeer.peerConnection.onconnectionstatechange = evt => console.log('connectionState', (evt.target as RTCPeerConnection).connectionState);
    this.webRtcPeer.peerConnection.oniceconnectionstatechange = evt => console.log('iceConnectionState', (evt.target as RTCPeerConnection).iceConnectionState);
    this.webRtcPeer.peerConnection.onicegatheringstatechange = evt => console.log('iceGatheringState', (evt.target as RTCPeerConnection).iceGatheringState);

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
      this.play();
    }
  }

  stop() {
    this.isPlaying = false;
    this.mirrorPlayButton.value = 'Play';
    this.mirrorPlayButton.classList.remove('active');
    this.webRtcPeer.dispose();
    this.webRtcPeer = null;
    this.webSocketModule.sendData('media/clientStop');
    this.emit('playStatus', false);
  }

  async play() {
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

    this.webSocketModule.sendData('media/sdpOffer', { sdpOffer: this.sdpOffer });
  }

  onRecordingClick() {
    if (!this.isPlaying) {
      return;
    }

    if (!this.isRecordOn) {
      this.webSocketModule.sendData('media/startRecord');
      this.mirrorRecordingButton.value = 'Stop Rec';
      this.isRecordOn = true;
    } else {
      this.webSocketModule.sendData('media/stopRecord');
      this.mirrorRecordingButton.value = 'Start Rec'
      this.isRecordOn = false;
    }


  }

  onCandidate(candidate: any) {
    this.webSocketModule.sendData('media/localCandidate', { candidate });
  }
}
