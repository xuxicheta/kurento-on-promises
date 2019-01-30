//@ts-check

import './scss/styles.scss';
import { config, files } from './units/index.unit';

// class Main {
//   constructor() {
//     // /** @type {KurentoNode} */
//     this.kurento = null;
//     // /** @type {PlayerEndpoint} */
//     // this.player = null;
//     // config.resolved.then(() => {
//     //   this.makingKurento();
//     //   this.buttonsActions();
//     // });
//   }

//   // makingKurento() {
//   //   this.kurento = new KurentoNode({
//   //     videoInput,
//   //     videoOutput,
//   //   });

//   //   this.player = new PlayerEndpoint({
//   //     videoOutput: playerEndpointOutput,
//   //   });
//   // }

//   // buttonsActions() {
//   //   ui.elements.videoInput_icon.onclick = () => {
//   //     if (this.kurento.lock.play) {
//   //       return;
//   //     }
//   //     if (!this.kurento.isPlaying) {
//   //       this.kurento.start()
//   //         .then(() => {
//   //           ui.toggleVideo();
//   //           ui.toggleRecButtonView();
//   //         })
//   //         .catch(() => ui.logAppend('kurento', 'start error'));
//   //     } else {
//   //       this.kurento.stop()
//   //         .then(() => {
//   //           ui.toggleVideo();
//   //           ui.toggleRecButtonView();
//   //         })
//   //         .catch(() => ui.logAppend('kurento', 'stop error'));
//   //     }
//   //   };

//   //   ui.elements.rec_icon.onclick = () => {
//   //     if (this.kurento.lock.record) {
//   //       return;
//   //     }
//   //     if (!this.kurento.isPlaying) {
//   //       return;
//   //     }
//   //     this.kurento.toggleRecord();
//   //   };
//   // }
// }


// const main = new Main(); // eslint-disable-line
