//@ts-check
const kurentoClient = require('kurento-client');
const logger = require('../modules/logger/logger.module');
const MEDIA_LAYER = logger.color.green('MEDIA_LAYER');
const log = logger.log;
// const { config } = require('../../config');

/**
 * Collection of Kurento operations. Promise wrappers around kurento-client
 */
const MediaLayer = {
  /**
  * @param {string} wsUri
  * @return {Promise<import('kurento-client')>};
  */
  createClient(wsUri) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        logger.error(`${MEDIA_LAYER} kurentoClient didn't created by timeout`);
        reject(new Error(`${MEDIA_LAYER} kurentoClient didn't created by timeout`));
      }, 10000);
      //@ts-ignore
      kurentoClient(wsUri, (err, client) => {
        if (err) {
          logger.error(`${MEDIA_LAYER} client didn't created`, wsUri, err);
          return reject(err);
        }
        log(`${MEDIA_LAYER} client created, server address: "${wsUri}"`);
        clearTimeout(timeout);
        return resolve(client);
      });
    });
  },

  /**
   * @param {import('kurento-client')} client
   * @return {Promise<import('kurento-client-core').MediaPipeline>}
   */
  createPipeline(client) {
    return new Promise((resolve, reject) => {
      client.create('MediaPipeline', (err, pipeline) => {
        const timeout = setTimeout(() => {
          logger.error(`${MEDIA_LAYER} pipeline didn't created by timeout`);
          reject(new Error(`${MEDIA_LAYER} pipeline didn't created by timeout`));
        }, 10000);
        if (err) {
          logger.error(`${MEDIA_LAYER} pipeline didn't created`, err, pipeline);
          return reject(err);
        }
        clearTimeout(timeout);
        resolve(pipeline);
      });
    });
  },

  /**
   * @param {import('kurento-client-core').MediaPipeline} pipeline
   * @return {Promise<import('kurento-client-elements').WebRtcEndpoint>}
   */
  createWebRtcEndpoint(pipeline) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        logger.error(`${MEDIA_LAYER} WebRtcEndpoint didn't created by timeout`);
        reject(new Error(`${MEDIA_LAYER} WebRtcEndpoint didn't created by timeout`));
      }, 10000);
      pipeline.create('WebRtcEndpoint', { useDataChannels: true }, (err, webRtcEndpoint) => {
        if (err) {
          logger.error(`${MEDIA_LAYER} pipeline didn't created`, err, pipeline);
          return reject(err);
        }
        clearTimeout(timeout);
        resolve(webRtcEndpoint);
      });
    });
  },

  /**
   * @param {import('kurento-client-core').MediaPipeline} pipeline
   * @param {string} uri
   * @param {string} mediaProfile
   * @return {Promise<import('kurento-client-elements').RecorderEndpoint>}
   */
  createRecorderEndpoint(pipeline, uri) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        logger.error(`${MEDIA_LAYER} RecorderEndpoint didn't created by timeout`);
        reject(new Error(`${MEDIA_LAYER} RecorderEndpoint didn't created by timeout`));
      }, 10000);
      const recorderEndpoint = pipeline.create('RecorderEndpoint', {
        uri,
      }, (error) => {
        if (error) {
          reject(error);
        }
        clearTimeout(timeout);
        resolve(recorderEndpoint);
      });
    });
  },

  /**
   * @return {string}
   */
  generateBaseRecordName() {
    return `${Date.now()}`;
  },

  /**
   *
   * @param {import('kurento-client-elements').WebRtcEndpoint} webRtcEndpoint
   * @param {import('kurento-client-elements').WebRtcEndpoint|import('kurento-client-elements').RecorderEndpoint} someEndpoint
   * @return {Promise<void>}
   */
  connectEndpoints(webRtcEndpoint, someEndpoint) {
    return new Promise((resolve, reject) => {
      //@ts-ignore
      webRtcEndpoint.connect(someEndpoint, (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  },

  /**
   * @param {import('kurento-client-elements').WebRtcEndpoint|import('kurento-client-elements').RecorderEndpoint} someEndpoint
   * @return {Promise<void>}
   */
  stopEndpoint(someEndpoint) {
    return new Promise((resolve, reject) => {
      //@ts-ignore
      if (!someEndpoint || !someEndpoint.stop) { // often happens, call stopEndpoint if no endpoint here
        resolve();
      }
      //@ts-ignore
      someEndpoint.stop((err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  },

  /**
   * processAnswer and gatherCandidates
   * @param {import('kurento-client-elements').WebRtcEndpoint} webRtcEndpoint
   * @param {string} offer
   * @return {Promise<string>}
   */
  getAnswer(webRtcEndpoint, offer) {
    return new Promise((resolve, reject) => {
      //@ts-ignore
      webRtcEndpoint.processOffer(offer, (errOffer, answer) => {
        if (errOffer) {
          reject(errOffer);
        }
        webRtcEndpoint.gatherCandidates((errGather) => {
          if (errGather) {
            reject(errGather);
          }
          resolve(answer);
        });
      });
    });
  },
};

module.exports.MediaLayer = MediaLayer;
