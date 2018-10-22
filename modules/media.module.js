const KurentoClient = require('kurento-client');
const { config } = require('./config.module');
const { socket } = require('./web-socket.module');

class Media {
  constructor(ws, offer) {
    this.client = null;
    this.pipeline = null;
    this.candidatesQueue = [];
    this.ws = ws;
    this.offer = offer;
    this.answer = '';
    this.STUN = '';
    this.TURN = '';
    this.pairs = null;
    this.init();
  }

  async init() {
    this.client = await KurentoClient(config.get('wsUri'));
    console.log('client ready', config.get('wsUri'), this.client);

    this.pipeline = await this.client.create('MediaPipeline');
    console.log('pipeline ready', this.pipeline);

    this.webRtcEndpoint = await this.pipeline.create('WebRtcEndpoint');
    console.log('webrtc endpoint ready', this.webRtcEndpoint);

    while (this.candidatesQueue.length) {
      this.webRtcEndpoint.addIceCandidate(this.candidatesQueue.shift());
    }
    this.setDebugListeners(this.webRtcEndpoint);
    this.sendCandidatesToClient();
    this.answer = await this.webRtcEndpoint.processOffer(this.offer);
    this.ws.send(JSON.stringify({
      type: 'media/answer',
      data: this.answer,
    }));
    this.webRtcEndpoint.gatherCandidates(this.onError);
    await this.webRtcEndpoint.connect(this.webRtcEndpoint);


    this.STUN = await this.webRtcEndpoint.getStunServerAddress();
    this.TURN = await this.webRtcEndpoint.getTurnUrl();
    this.pairs = await this.webRtcEndpoint.getICECandidatePairs();
    console.log(this);


  }

  setDebugListeners(webRtcEndpoint) {
    const add = (evName) => {
      webRtcEndpoint.on(evName, (event) => {
        console.log(evName, event);
      });
    };

    add('IceComponentStateChange');
    add('IceGatheringDone');
    // add('IceCandidateFound');
    add('NewCandidatePairSelected');
    add('DataChannelOpen');
    add('DataChannelClose');
  }

  sendCandidatesToClient() {
    this.webRtcEndpoint.on('OnIceCandidate', (event) => {
      const candidate = KurentoClient.getComplexType('IceCandidate')(event.candidate);
      this.ws.send(JSON.stringify({
        type: 'media/remoteCandidate',
        data: candidate,
      }));
    });
  }

  addWebRtcEndpointCandidates(data) {
    const candidate = KurentoClient.getComplexType('IceCandidate')(data);
    if (this.webRtcEndpoint) {
      this.webRtcEndpoint.addIceCandidate(candidate);
    } else {
      this.candidatesQueue.push(candidate);
      // console.log('queued');
    }
  }
}

// const media = {
//   async onOffer(data, ws, session) {
//     session.client = await KurentoClient(config.get('wsUri'));

//     session.offer = data;
//   },
// };

socket.addHandler('media/offer', (data, ws) => {
  ws.media = new Media(ws, data);
});

socket.addHandler('media/localCandidate', (data, ws) => {
  // console.log('local candidate', data);

  /** @type {Media} */
  const media = ws.media;
  media.addWebRtcEndpointCandidates(data);
});

// module.exports.media = media;
module.exports.Media = Media;
