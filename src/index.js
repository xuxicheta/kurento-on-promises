//@ts-check

import './scss/styles.scss';
import { config } from './config';
import { KurentoNode } from './kurento-node';
import { ui } from './ui/ui';
import './files';
import { PlayerEndpoint } from './player-endpoint';

const videoInput = ui.elements.videoInput;
const videoOutput = ui.elements.videoOutput;
const playerEndpointOutput = ui.elements.playerEndpointOutput;

class Main {
  constructor() {
    /** @type {KurentoNode} */
    this.kurento = null;
    /** @type {PlayerEndpoint} */
    this.player = null;
    config.resolved.then(() => {
      this.makingKurento();
      this.buttonsActions();
    });
  }

  makingKurento() {
    this.kurento = new KurentoNode({
      videoInput,
      videoOutput,
    });

    this.player = new PlayerEndpoint({
      videoOutput: playerEndpointOutput,
    });
  }

  buttonsActions() {
    ui.elements.videoInput_icon.onclick = () => {
      if (this.kurento.lock.play) {
        return;
      }
      if (!this.kurento.isPlaying) {
        this.kurento.start()
          .then(() => {
            ui.toggleVideo();
            ui.toggleRecButtonView();
          })
          .catch(() => ui.logAppend('kurento', 'start error'));
      } else {
        this.kurento.stop()
          .then(() => {
            ui.toggleVideo();
            ui.toggleRecButtonView();
          })
          .catch(() => ui.logAppend('kurento', 'stop error'));
      }
    };

    ui.elements.rec_icon.onclick = () => {
      if (this.kurento.lock.record) {
        return;
      }
      if (!this.kurento.isPlaying) {
        return;
      }
      this.kurento.toggleRecord();
    };
  }
}


const main = new Main(); // eslint-disable-line
