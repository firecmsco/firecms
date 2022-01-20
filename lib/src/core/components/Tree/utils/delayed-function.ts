export default class DelayedFunction {
  delay: number;

  timeoutId: number | undefined;

  fn?: Function;

  constructor(delay: number) {
    this.delay = delay;
  }

  start(fn: Function) {
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
