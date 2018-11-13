const KurentoClient = require('kurento-client');
const { MediaPipeline } = require('kurento-client-core'); // eslint-disable-line
const { WebRtcEndpoint, RecorderEndpoint, PlayerEndpoint } = require('kurento-client-elements'); // eslint-disable-line
const config = require('./config.lib');
const socket = require('./web-socket.lib');

class PlayerClass {
  /**
   *
   * @param {WebSocket} ws
   * @param {string} offer
   */
  constructor(ws, offer) {
    this.client = null;
    /** @type {MediaPipeline} */
    this.pipeline = null;
    /** @type {WebRtcEndpoint} */
    this.webRtcEndpoint = null;
    /** @type {RecorderEndpoint} */
    this.recordEndpoint = null;
    /** @type {RecorderEndpoint} */
    this.fileRecordEndpoint = null;
    /** @type {PlayerEndpoint} */
    this.playerEndpoint = null;

    this.candidatesQueue = [];
    this.ws = ws;
    this.offer = offer;
    this.answer = '';
    this.STUN = '';
    this.TURN = '';
    this.pairs = null;
    this.init();
  }

  /**
   * @async
   */
  async init() {
    //@ts-ignore
    if (!PlayerClass.client) {
      this.client = await KurentoClient(config.get('kurentoWsUri'));
      PlayerClass.client = this.client;
      console.log('MEDIA created client');
    } else {
      this.client = PlayerClass.client;
    }

    this.pipeline = await this.client.create('MediaPipeline');
    console.log(`MEDIA created pipeline "${this.pipeline.id}"`);

    this.webRtcEndpoint = await this.createWebRtcEndpoint(this.offer);

    /** @type {any[]} */
    this.pairs = await this.webRtcEndpoint.getICECandidatePairs();
    this.pairs.forEach((pair) => {
      console.log(`MEDIA local candidate ${pair.localCandidate}`);
      this.sendLog('local candidate', pair.localCandidate);

      console.log(`MEDIA remote candidate ${pair.remoteCandidate}`);
      this.sendLog('remote candidate', pair.remoteCandidate);

    });
  }

  async createWebRtcEndpoint(offer) {
    const webRtcEndpoint = await this.pipeline.create('WebRtcEndpoint');
    console.log(`MEDIA created webRtcEndpoint "${webRtcEndpoint.id}"`);

    while (this.candidatesQueue.length) {
      webRtcEndpoint.addIceCandidate(this.candidatesQueue.shift(), () => { });
    }
    this.setDebugListeners(webRtcEndpoint);
    this.sendCandidatesToClient(webRtcEndpoint);
    this.answer = await webRtcEndpoint.processOffer(offer);

    await this.gatherCandidates(webRtcEndpoint);

    this.STUN = await webRtcEndpoint.getStunServerAddress();
    this.TURN = await webRtcEndpoint.getTurnUrl();
    process.nextTick(() => {
      this.sendData('answer', this.answer);
    });

    return webRtcEndpoint;
  }

  /**
   * @param {WebRtcEndpoint} webRtcEndpoint
   */
  setDebugListeners(webRtcEndpoint) {
    /** taken from source kurento-client */
    const eventsArray = [
      // webRtcEndpoint events
      'DataChannelClose',
      'DataChannelOpen',
      'IceCandidateFound',
      'IceComponentStateChange',
      'IceGatheringDone',
      'NewCandidatePairSelected',
      'OnDataChannelClosed',
      'OnDataChannelOpened',
      // 'OnIceCandidate',
      // 'OnIceComponentStateChanged',
      'OnIceGatheringDone',
      'MediaFlowInStateChange',
      'MediaFlowOutStateChange',
      // BaseEndpoint events
      'ConnectionStateChanged',
      'MediaStateChanged',
    ];

    eventsArray.forEach((eventName) => {
      webRtcEndpoint.on(eventName, (event) => {
        this.sendData('event', event);
      });
    });


  }

  /**
   * @param {WebRtcEndpoint} webRtcEndpoint
   */
  sendCandidatesToClient(webRtcEndpoint) {
    webRtcEndpoint.on('OnIceCandidate', (event) => {
      const candidate = KurentoClient.getComplexType('IceCandidate')(event.candidate);
      this.sendData('remoteCandidate', candidate);
    });
  }

  /**
   * @param {string} type
   * @param {*} data
   */
  sendData(type, data = '') {
    this.ws.sendData(`player/${type}`, data);
  }

  /**
   * @param {string} header
   * @param {string} message
   */
  sendLog(header, message) {
    this.ws.sendData('log/append', {
      header,
      message,
    });
  }

  addWebRtcEndpointCandidates(data) {
    const candidate = KurentoClient.getComplexType('IceCandidate')(data);
    if (this.webRtcEndpoint) {
      this.webRtcEndpoint.addIceCandidate(candidate);
    } else {
      this.candidatesQueue.push(candidate);
    }
  }


  /**
   * @param {string} fileUri
   * @returns {PlayerEndpoint}
   */
  async createPlayerEndpoint(fileUri) {

    /** @type {PlayerEndpoint} */
    const playerEndpoint = await this.pipeline.create('PlayerEndpoint', {
      uri: `file://${config.get('kurentoFilesPath')}/${fileUri}`,
    });
    await this.webRtcEndpoint.connect(playerEndpoint);
    await playerEndpoint.play();
    this.sendLog('player', 'creating');
    this.playerEndpoint = playerEndpoint;
    console.log(`PLAYER created "${playerEndpoint.id}"`);
    return playerEndpoint;
  }

  /**
   * @param {PlayerEndpoint} playerEndpoint
   */
  async stopPlayer(playerEndpoint) {
    if (playerEndpoint && playerEndpoint.stop) {
      if (playerEndpoint.stop) {
        playerEndpoint.stop();
      }
      if (playerEndpoint.release) {
        playerEndpoint.release();
      }
      this.sendData('player-stopped');
      this.sendLog('player', 'stoping');
    }
  }

  /**
   * @async
   */
  async stop() {
    console.log('MEDIA stopped');

    await this.stopPlayer();

    if (this.webRtcEndpoint && this.webRtcEndpoint.release) {
      this.webRtcEndpoint.release();
    }
    if (this.pipeline && this.pipeline.release) {
      this.pipeline.release();
    }
    this.sendData('stopped');
  }

  async gatherCandidates(webRtcEndpoint) {
    return new Promise((resolve, reject) => {
      webRtcEndpoint.gatherCandidates((error) => {
        if (error) {
          reject(error);
        }
        this.sendLog('media', 'candidates gathered');
        resolve();
      });
    });
  }

  static assignWebSocket() {
    socket
      .setHandler('player/offer', (data, ws) => {
        ws.player = new PlayerClass(ws, data);
      })
      .setHandler('player/localCandidate', (data, ws) => {
        /** @type {PlayerClass} */
        const player = ws.player;
        if (player && player.addWebRtcEndpointCandidates) {
          player.addWebRtcEndpointCandidates(data);
        }
      })
      .setHandler('player/play', (data, ws) => {
        /** @type {PlayerClass} */
        const player = ws.player;
        player.createPlayerEndpoint(data);
      })
      .setHandler('player/stop', (data, ws) => {
        /** @type {PlayerClass} */
        const player = ws.player;
        if (player && player.stop) {
          player.stop();
        }
      });
  }
}

module.exports = { PlayerClass };
