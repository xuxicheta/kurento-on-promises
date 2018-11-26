//@ts-check
const colors = [
  'red',
  'blue',
  'green',
  'yellow',
];

class Status {
  constructor() {
    this.root = document.getElementById('status');
    this.elements = [];
  }

  set(key, value) {
    let element;
    const existed = this.elements.find(el => el.key.textContent === key);
    if (!existed) {
      element = this.createElement(key, value);
      this.elements.push(element);
    } else {
      element = existed;
      element.value.textContent = value;
    }
  }

  createElement(key, val) {
    const el = document.createElement('div');
    const keySpan = document.createElement('span');
    keySpan.classList.add('key');
    keySpan.textContent = key;
    const valueSpan = document.createElement('span');
    valueSpan.classList.add('value');
    valueSpan.textContent = val;
    el.appendChild(keySpan);
    el.appendChild(valueSpan);
    this.root.appendChild(el);
    return {
      element: el,
      key: keySpan,
      value: valueSpan,
    };
  }

  setColor(key, color) {
    const existed = this.elements.find(el => el.key.textContent === key);
    /** @type {HTMLDivElement} */
    const element = existed.element;
    if (existed) {
      colors.forEach((_color) => {
        element.classList.remove(_color);
      });
      element.classList.add(color);
    }
  }
}

export const status = new Status();
