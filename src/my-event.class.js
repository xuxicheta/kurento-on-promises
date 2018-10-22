export class MyEvent {
  constructor() {
    this.listeners = [];
    this.onetimers = [];
  }

  emit(value) {
    this.onetimers.forEach(cb => cb(value));
    this.onetimers = [];
    this.listeners.forEach(cb => cb(value));
  }

  on(cb) {
    this.listeners.push(cb);
  }

  once(cb) {
    this.onetimers.push(cb);
  }

  off(cb) {
    this.listeners = this.listeners.filter(_cb => _cb !== cb);
  }
}
