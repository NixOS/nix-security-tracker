declare class AnimationFrame {
    static create(): AnimationFrame;
    private id;
    private fn_cleanup;
    request(fn?: VoidFunction | (() => VoidFunction)): void;
    cancel(): void;
    isActive(): boolean;
    cleanup: () => void;
}
declare function raf(fn: VoidFunction | (() => VoidFunction)): () => void;
declare function nextTick(fn: VoidFunction): () => void;
declare function queueBeforeEvent(el: EventTarget, type: string, cb: () => void): () => void;

export { AnimationFrame, nextTick, queueBeforeEvent, raf };
