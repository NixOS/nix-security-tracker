declare class Timeout {
    currentId: any;
    start(delay: number, fn: Function): void;
    isStarted(): boolean;
    clear: () => void;
    disposeEffect: () => () => void;
}

export { Timeout };
