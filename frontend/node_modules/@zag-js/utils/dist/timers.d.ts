interface TimerBaseContext {
    startMs: number;
    deltaMs: number;
}
interface TimerContext extends TimerBaseContext {
    now: number;
}
type TimerContextFn = (ctx: TimerContext) => boolean | void;
declare class Timer {
    #private;
    private readonly onTick;
    private frameId;
    private pausedAtMs;
    private context;
    constructor(onTick: TimerContextFn);
    private cancelFrame;
    setStartMs: (startMs: number) => void;
    get elapsedMs(): number;
    start: () => void;
    pause: () => void;
    stop: () => void;
}
declare function setRafInterval(fn: (ctx: TimerBaseContext) => void, intervalMs: number): () => void;
declare function setRafTimeout(fn: () => void, delayMs: number): () => void;

export { Timer, type TimerBaseContext, type TimerContextFn, setRafInterval, setRafTimeout };
