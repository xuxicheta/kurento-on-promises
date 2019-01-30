//@ts-check
export class DirectPlayerUI {
  constructor() {
    /** @type {HTMLDivElement} */
    this.filelistSection = document.querySelector('#filelist-section');
    /** @type {HTMLDivElement} */
    this.filelistTitle = document.querySelector('#filelist-title');
    /** @type {HTMLDivElement} */
    this.filelistContent = document.querySelector('#filelist-content');
    /** @type {HTMLDivElement} */
    this.fileList = document.querySelector('#filelist');
    /** @type {string[]} */
    this.list = [];
    /** @type {HTMLAnchorElement[]} */
    this.listLinks = [];
    /** @type {boolean[]} */
    this.listActives = [];


    this.filelistTitle.onclick = () => this.filelistContent.classList.toggle('hidden');
  }

  /**
   * @param {string[]} list
   */
  setFiles(list) {
    this.list = list;
    this.listActives = list.map(() => false);

    this.fileList.innerHTML = '';
    this.listLinks = this.list.map((link) => {
      const a = document.createElement('a');
      a.textContent = link;
      this.fileList.appendChild(a);
      return a;
    });
  }

  enliveFileList() {
    const onClickAnchor = (el) => {
      this.listLinks.forEach((anc) => {
        anc.classList.remove('active');
      });
      console.log(el);
    };

    this.listLinks.forEach((anc) => {
      anc.onclick = onClickAnchor;
    });

    // Array
    //   .from(this.fileList.querySelectorAll('a'))
    //   .forEach((el, i, arr) => {
    //     el.onclick = () => {
    //       // arr.forEach((a1) => {
    //       //   a1.classList.remove('active');
    //       // });
    //       el.isActive = !el.isActive;
    //       if (el.isActive) {
    //         el.classList.add('active');
    //         this.elements.playerOutput.src = el.innerText;
    //         this.elements.playerOutput.play();
    //       } else {
    //         this.elements.playerOutput.pause();
    //       }
    //     };
    //   });
  }
}
