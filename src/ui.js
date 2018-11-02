
export class UI {
  constructor() {
    this.values = {};
    this.defaults = {};
    this.elements = {
      /** @type {HTMLSpanElement} */
      wsUri: document.querySelector('#wsUri'),
      /** @type {HTMLButtonElement} */
      recordButton: document.querySelector('#dorecord'),
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

}

export const ui = new UI();
