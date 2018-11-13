export class MyEvent {
  constructor() {
    this.listeners = [];
    this.onetimers = [];
    this.value = undefined;
    this.addEventListener = this.on;
    this.removeListener = this.off;
  }

  emit(value) {
    this.value = value;
    this.onetimers.forEach(cb => cb(value));
    this.onetimers = [];
    this.listeners.forEach(cb => cb(value));
  }

  /**
   * @callback MyEventListener
   * @param {*} value
   */

  /**
   * @param {MyEventListener} cb
   */
  on(cb) {
    this.listeners.push(cb);
  }

  once(cb) {
    this.onetimers.push(cb);
  }

  off(cb) {
    this.listeners = this.listeners.filter(_cb => _cb !== cb);
  }

  removeAllListeners() {
    this.listeners = [];
  }
}
