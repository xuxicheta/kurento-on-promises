//@ts-check

import Kurento from './kurento';

const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const autoStart = document.getElementById('autostart');
const record = document.getElementById('record');
const recordButton = document.getElementById('dorecord');
//@ts-ignore
autoStart.checked = config.isAutoStart;
//@ts-ignore
record.checked = config.isRecord;


const kurento = new Kurento({
  videoInput: document.getElementById('videoInput'),
  videoOutput: document.getElementById('videoOutput'),
  startButton,
  stopButton,
});

const actions = {
  startVideo() {
    startButton.classList.add('active');
    stopButton.classList.remove('active');

    kurento.createPipeline()
      .then(() => kurento.createRecorder());
  },

  stopVideo() {
    startButton.classList.remove('active');
    stopButton.classList.add('active');

    kurento.stop();
  },
  setAutostart() {
    config.setItem('autostart', this.checked);
  },
  setRecord() {
    config.setItem('record', this.checked);
  },
  startRecord() {
    const dt = kurento.record();
    console.log(dt);

  },
};

startButton.addEventListener('click', actions.startVideo);
stopButton.addEventListener('click', actions.stopVideo);
recordButton.addEventListener('click', actions.startRecord);

autoStart.addEventListener('change', actions.setAutostart);
record.addEventListener('change', actions.setRecord);

if (config.isAutoStart) {
  actions.startVideo();
} else {
  actions.stopVideo();
}
