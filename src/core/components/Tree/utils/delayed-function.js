export default class DelayedFunction {
  constructor(delay) {
    this.delay = delay;
  }

  start(fn) {
    this.stop();
    this.timeoutId = window.setTimeout(fn, this.delay);
  }

  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

}