
export class UI {
  constructor() {
    this.values = {};
    this.defaults = {};
    this.elements = {
      /** @type {HTMLSpanElement} */
      wsUri: document.querySelector('#wsUri'),
      /** @type {HTMLSpanElement} */
      recordStatus: document.querySelector('#recordStatus'),
      /** @type {HTMLDivElement} */
      fileList: document.querySelector('#filelist'),
      /** @type {HTMLVideoElement} */
      videoInput: document.querySelector('#videoInput'),
      /** @type {HTMLVideoElement} */
      videoOutput: document.querySelector('#videoOutput'),
      /** @type {HTMLVideoElement} */
      playerOutput: document.querySelector('#playerOutput'),
      /** @type {HTMLDivElement} */
      log: document.querySelector('#log'),
      /** @type {HTMLDivElement} */
      videoInput_icon: document.querySelector('#videoInput_icon'),
      /** @type {HTMLImageElement} */
      play_icon: document.querySelector('#play_icon'),
      /** @type {HTMLImageElement} */
      stop_icon: document.querySelector('#stop_icon'),
      /** @type {HTMLImageElement} */
      rec_icon: document.querySelector('#rec_icon'),
    };
    Object.keys(this.elements).forEach((prop) => {
      this.defaults[prop] = this.elements[prop].innerHTML;
    });
  }

  set(prop, value) {
    /** @type {HTMLElement} */
    const element = this.elements[prop];
    if (element instanceof HTMLElement) {
      this.values[prop] = value;
      element.innerHTML = value;
    }
  }

  reset(prop) {
    /** @type {HTMLElement} */
    const element = this.elements[prop];
    if (element instanceof HTMLElement) {
      element.innerHTML = this.defaults[prop];
    }
  }

  unreset(prop) {
    /** @type {HTMLElement} */
    const element = this.elements[prop];
    if (element instanceof HTMLElement) {
      element.innerHTML = this.values[prop];
    }
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

  enliveFileList() {
    const list = Array.from(this.elements.fileList.querySelectorAll('a'));
    list.forEach((a) => {
      a.onclick = () => {

        list.forEach((a1) => {
          a1.classList.remove('active');
        });
        a.isActive = !a.isActive;
        if (a.isActive) {
          a.classList.add('active');
          this.elements.playerOutput.src = a.innerText;
          this.elements.playerOutput.play();
        } else {
          a.classList.remove('active');
          this.elements.playerOutput.pause();
        }
      };
    });
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
    const boderStyle = '1px solid red';
    this.elements.videoOutput.style.border = this.elements.videoOutput.style.border === boderStyle
      ? ''
      : boderStyle;
  }

}

export const ui = new UI();
