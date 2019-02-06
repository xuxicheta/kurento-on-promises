
//@ts-ignore
import { WebRtcPeer } from './kurento-utils';

/**
 * @typedef {import('kurento-utils').WebRtcPeer} WebRtcPeer
 * @typedef {object} WebRtcPeerOptions
 * @property {HTMLVideoElement} [localVideo] Video tag in the application for the local stream.
 * @property {HTMLVideoElement} [remoteVideo] Video tag in the application for the remote stream.
 * @property {MediaStream} [videoStream] Provides an already available video stream that will be used instead of using the media stream from the local webcam.
 * @property {MediaStream} [audioStream] Provides an already available audio stream that will be used instead of using the media stream from the local microphone.
 * @property {MediaStreamConstraints} [mediaConstraints] Defined the quality for the video and audio
 * @property {*} [connectionConstraints] Defined the connection constraint according with browser like googIPv6, DtlsSrtpKeyAgreement…
 * @property {RTCPeerConnection} [peerConnection] Use a peerConnection which was created before
 * @property {'webcam'|'screen'|'window'} [sendSource] Which source will be used
 * @property {Function} [onstreamended] Method that will be invoked when stream ended event happens
 * @property {Function} [onicecandidate] Method that will be invoked when ice candidate event happens -- event 'icecandidate'
 * @property {Function} [oncandidategatheringdone] Method that will be invoked when all candidates have been harvested -- event 'candidategatheringdone'
 * @property {boolean} [dataChannels] Flag for enabling the use of data channels. If true, then a data channel will be created in the RTCPeerConnection object.
 * @property {DataChannelConfig} [dataChannelConfig] It is a JSON object with the configuration passed to the DataChannel when created. It supports the following keys:
 * @property {Configuration} [configuration] It is a JSON object where ICE Servers are defined using
 *
 * @typedef {object} DataChannelConfig
 * @property {string} [id] Specifies the id of the data channel. If none specified, the same id of the WebRtcPeer object will be used.
 * @property {*} [options] Options object passed to the data channel constructor.
 * @property {Function} [onopen] Function invoked in the onopen event of the data channel, fired when the channel is open.
 * @property {Function} [onclose] Function invoked in the onclose event of the data channel, fired when the data channel is closed.
 * @property {Function} [onmessage] Function invoked in the onmessage event of the data channel. This event is fired every time a message is received.
 * @property {Function} [onbufferedamountlow] Is the event handler called when the bufferedamountlow event is received. Such an event is sent when RTCDataChannel.bufferedAmount drops to less than or equal to the amount specified by the RTCDataChannel.bufferedAmountLowThreshold property.
 * @property {Function} [onerror] Callback function onviked when an error in the data channel is produced. If none is provided, an error trace message will be logged in the browser console.
 * @property {boolean} [simulcast] Indicates whether simulcast is going to be used. Value is true|false
 *
 * @typedef {object} Configuration
 * @property {*} [iceServers] iceServers: The format for this variable is like: `[{"urls":"turn:turn.example.org","username":"user","credential":"myPassword"}][{"urls":"stun:stun1.example.net"},{"urls":"stun:stun2.example.net"}]`
 */

export const KurentoWrapper = {
  /**
   * @param {WebRtcPeerOptions} options
   * @returns {Promise<WebRtcPeer>}
   */
  createWebRtcPeer(options) {
    return new Promise((resolve, reject) => {
      WebRtcPeer.WebRtcPeerSendrecv(options, function (error) {
        if (error) {
          reject(error);
        }
        resolve(this);
      });
    });
  },
  /**
   * @param {WebRtcPeer} webRtcPeer
   * @returns {Promise<string>}
   */
  generateOffer(webRtcPeer) {
    return new Promise((resolve, reject) => {
      webRtcPeer.generateOffer((errorOffer, offer) => {
        if (errorOffer) {
          reject(errorOffer);
        }
        resolve(offer);
      });
    });
  },
  /**
   * @param {WebRtcPeer} webRtcPeer
   * @param {string} answer
   */
  processAnswer(webRtcPeer, answer) {
    return new Promise((resolve, reject) => {
      webRtcPeer.processAnswer(answer, (error) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  },
};
