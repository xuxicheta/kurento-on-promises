//@ts-check

import { config } from './config';
import { KurentoNode } from './kurento-node.class';
import { ui } from './ui'; // eslint-disable-line
import './files';

const videoInput = document.getElementById('videoInput');
const videoOutput = document.getElementById('videoOutput');


config.resolved.then(() => {
  const kurento = new KurentoNode({
    videoInput,
    videoOutput,
  });

  //@ts-ignore
  window.kurento = kurento;

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
