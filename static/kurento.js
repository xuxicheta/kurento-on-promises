class Kurento {
  constructor({
    videoInput,
    videoOutput,
    startButton,
    stopButton,
  }) {
    console.log('kurento constructor');
    
    this.webRtcPeer = null;
    this.webRtcEndpoint = null;
    this.recorderEndpoint = null;
    this.pipeline = null;
    this.localCandidates = [];
    this.remoteCandidates = [];
    this.offer = '';
    this.answer = '';

    this.videoInput = document.getElementById('videoInput');
    this.videoOutput = document.getElementById('videoOutput');

    this.startButton = document.getElementById("start");
    this.stopButton = document.getElementById("stop");

    this.options = this.createOptions('relay');
  }

  createOptions(iceTransportPolicy) {
    return {
      localVideo: this.videoInput,
      remoteVideo: this.videoOutput,
      iceTransportPolicy: iceTransportPolicy,
    };
  }

  async createPipeline() {
    /** @type {string} */
    this.offer = await this.generateOffer(this.options);
    console.log('offer ready');

    this.client = await kurentoClient(config.wsUri);
    console.log('client ready');

    this.pipeline = await this.client.create('MediaPipeline');
    console.log('pipeline ready');

    this.webRtcEndpoint = await this.pipeline.create('WebRtcEndpoint');
    this.setWebRtcEndpointListeners(this.webRtcEndpoint);
    this.setIceCandidateCallbacks(this.webRtcPeer, this.webRtcEndpoint, this.onError);

    this.answer = await this.webRtcEndpoint.processOffer(this.offer);
    console.log('answer ready');
    this.webRtcPeer.processAnswer(this.answer);
    console.log('answer processed');
    
    this.webRtcEndpoint.gatherCandidates(this.onError);
    await this.webRtcEndpoint.connect(this.webRtcEndpoint);
    this.STUN = await this.webRtcEndpoint.getStunServerAddress();
    this.TURN = await this.webRtcEndpoint.getTurnUrl();
    this.pairs = await this.webRtcEndpoint.getICECandidatePairs();
    console.log(this);
  }

  onError(error) {
    if (!error) {
      return;
    }

    if (typeof error === 'object' && error.hasOwnProperty('error') && !(error).error) {
      return;
    }
    console.error(error);
  }

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
          resolve(offer);
        });
      });
    });
  }

  setIceCandidateCallbacks(webRtcPeer, webRtcEp, onerror, localCandidates, remoteCandidates) {
    webRtcPeer.on('icecandidate', (event) => {
      const candidate = kurentoClient.getComplexType('IceCandidate')(event);
      this.localCandidates.push(candidate);
      webRtcEp.addIceCandidate(candidate, onerror)
    });
  
    webRtcEp.on('OnIceCandidate', (event) => {
      const candidate = event.candidate;
      this.remoteCandidates.push(candidate);
      webRtcPeer.addIceCandidate(candidate, onerror);
    });
  }

  setWebRtcEndpointListeners(webRtcEndpoint) {
    const add = evName => {
      webRtcEndpoint.on(evName, (event) => {
        console.log(evName, event);
      })
    };

    add('IceComponentStateChange');
    add('IceGatheringDone');
    // add('IceCandidateFound');
    add('NewCandidatePairSelected');
    add('DataChannelOpen');
    add('DataChannelClose');
  }

  async stop() {
    if (this.recorderEndpoint) {
      this.recorderEndpoint.release();
    }
    if (this.webRtcEndpoint) {
      this.webRtcEndpoint.release();
    }
    if (this.webRtcPeer) {
      this.webRtcPeer.dispose();
    }
    if (this.pipeline) {
      this.pipeline.release();
    }
  }

  async createRecorder() {
    this.recorderEndpoint = await this.pipeline.create('RecorderEndpoint', {
      uri: 'file:///tmp/record.webm',
    });
    await this.webRtcEndpoint.connect(this.recorderEndpoint);
    console.log('recorder endpoint created', await this.recorderEndpoint.getUri());
  }

  record() {
    return this.recorderEndpoint.record();
  }
}