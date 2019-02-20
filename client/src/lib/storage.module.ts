export const storage = {
  prefix: 'k-o-p/',
  getItem(prop: STORAGE): string {
    return localStorage.getItem(`${this.prefix}${prop}`)
  },
  setItem(prop: STORAGE, value: string): void {
    localStorage.setItem(`${this.prefix}${prop}`, value);
  },
  removeItem(prop: STORAGE): void {
    localStorage.removeItem(`${this.prefix}${prop}`);
  },
};

export enum STORAGE {
  PLAYING = 'playing',
  RECORDING = 'recording',
  SESSION_ID = 'sessionId',
}
