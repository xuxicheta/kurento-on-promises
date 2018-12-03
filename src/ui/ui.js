
import { socket } from '../web-socket';
import DirectPlayer from './direct-player';

export class UI {
  constructor() {
    this.directPlayer = new DirectPlayer();
    // this.values = {};
    // this.defaults = {};

    // /** @type {HTMLSpanElement} */const recordStatus = document.querySelector('#recordStatus');
    // this.elements = {
    //   recordStatus,
    //   /** @type {HTMLDivElement} */
    //   fileList2: document.querySelector('#filelist2'),
    //   /** @type {HTMLVideoElement} */
    //   videoInput: document.querySelector('#videoInput'),
    //   /** @type {HTMLVideoElement} */
    //   videoOutput: document.querySelector('#videoOutput'),
    //   /** @type {HTMLVideoElement} */
    //   playerEndpointOutput: document.querySelector('#playerEndpointOutput'),
    //   /** @type {HTMLVideoElement} */
    //   player3EndpointOutput: document.querySelector('#playerEndpointOutput'),
    //   /** @type {HTMLVideoElement} */
    //   playerOutput: document.querySelector('#playerOutput'),
    //   /** @type {HTMLDivElement} */
    //   log: document.querySelector('#log'),
    //   /** @type {HTMLDivElement} */
    //   videoInput_icon: document.querySelector('#videoInput_icon'),
    //   /** @type {HTMLImageElement} */
    //   play_icon: document.querySelector('#play_icon'),
    //   /** @type {HTMLImageElement} */
    //   stop_icon: document.querySelector('#stop_icon'),
    //   /** @type {HTMLImageElement} */
    //   rec_icon: document.querySelector('#rec_icon'),
    //   playerTitle: document.querySelector('#player-title'),
    //   playerSection: document.querySelector('#player-section'),
    //   mirrorTitle: document.querySelector('#mirror-title'),
    //   mirrorSection: document.querySelector('#mirror-section'),
    // };
    // Object.keys(this.elements).forEach((prop) => {
    //   if (this.defaults[prop]) {
    //     this.defaults[prop] = this.elements[prop].innerHTML;
    //   }
    // });
    this.listenSocket();

    this.elements.playerTitle.onclick = () => this.elements.playerSection.classList.toggle('hidden');
    this.elements.mirrorTitle.onclick = () => this.elements.mirrorSection.classList.toggle('hidden');

  }

  logAppend(type = '', message) {
    const div = document.createElement('div');
    const strong = document.createElement('strong');
    const span = document.createElement('span');
    strong.innerText = `${type} `;
    span.innerText = message;
    div.appendChild(strong);
    div.appendChild(span);
    this.elements.log.appendChild(div);
  }

  enlivePlayerList() {
    Array
      .from(this.elements.fileList2.querySelectorAll('a'))
      .forEach((el, i, arr) => {
        el.onclick = () => {
          arr.forEach((a1) => {
            a1.classList.remove('active');
          });
          el.isActive = !el.isActive;
          if (el.isActive) {
            el.classList.add('active');
            this.initPlayer(el.innerText);
          } else {
            this.stopPlayer();
          }
        };
      });
  }

  initPlayer(url) {
    socket.sendData('files/check-url', url);
  }

  stopPlayer() {
    socket.sendData('player/stop', '');
  }


  toggleVideo() {
    this.elements.play_icon.style.display = this.elements.play_icon.style.display
      ? ''
      : 'none';
    this.elements.stop_icon.style.display = this.elements.stop_icon.style.display
      ? ''
      : 'none';
  }

  toggleRecButtonView() {
    this.elements.rec_icon.style.display = this.elements.rec_icon.style.display
      ? ''
      : 'none';
  }

  toggleRecBorder() {
    const boderStyle = '2px solid red';
    this.elements.videoOutput.style.border = this.elements.videoOutput.style.border === boderStyle
      ? ''
      : boderStyle;
  }

  listenSocket() {
    socket.setHandler('log/append', (data) => {
      this.logAppend(data.type || data.header, data.message);
    });
  }

}


export const ui = new UI();
