export default class DelayedFunction {
    delay: number;
    timeoutId: number | undefined;
    fn?: Function;
    constructor(delay: number);
    start(fn: Function): void;
    stop(): void;
}
