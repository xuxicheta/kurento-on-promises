//@ts-check

import { config } from './config';
import { KurentoNode } from './kurento-node.class';
import { ui } from './ui'; // eslint-disable-line
import './files';
import { PlayerEndpoint } from './player-endpoint.class';

const videoInput = ui.elements.videoInput;
const videoOutput = ui.elements.videoOutput;
const playerEndpointOutput = ui.elements.playerEndpointOutput;


config.resolved.then(() => {
  const kurento = new KurentoNode({
    videoInput,
    videoOutput,
  });

  const kurentoPlayer = new PlayerEndpoint({
    videoOutput: playerEndpointOutput,
  });

  //@ts-ignore
  window.kurento = kurento;
  //@ts-ignore
  window.kurentoPlayer = kurentoPlayer;

  ui.elements.videoInput_icon.onclick = () => {
    if (kurento.lock.play) {
      return;
    }
    if (!kurento.isPlaying) {
      kurento.start()
        .then(() => {
          ui.toggleVideo();
          ui.toggleRecButtonView();
        })
        .catch(() => ui.logAppend('kurento', 'start error'));
    } else {
      kurento.stop()
        .then(() => {
          ui.toggleVideo();
          ui.toggleRecButtonView();
        })
        .catch(() => ui.logAppend('kurento', 'stop error'));
    }
  };

  ui.elements.rec_icon.onclick = () => {
    if (kurento.lock.record) {
      return;
    }
    if (!kurento.isPlaying) {
      return;
    }
    kurento.toggleRecord();
  };
});
