import {
  __privateAdd,
  __privateGet,
  __publicField
} from "./chunk-MXGZDBDQ.mjs";

// src/timers.ts
var currentTime = () => performance.now();
var _tick;
var Timer = class {
  constructor(onTick) {
    __publicField(this, "onTick", onTick);
    __publicField(this, "frameId", null);
    __publicField(this, "pausedAtMs", null);
    __publicField(this, "context");
    __publicField(this, "cancelFrame", () => {
      if (this.frameId === null) return;
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    });
    __publicField(this, "setStartMs", (startMs) => {
      this.context.startMs = startMs;
    });
    __publicField(this, "start", () => {
      if (this.frameId !== null) return;
      const now = currentTime();
      if (this.pausedAtMs !== null) {
        this.context.startMs += now - this.pausedAtMs;
        this.pausedAtMs = null;
      } else {
        this.context.startMs = now;
      }
      this.frameId = requestAnimationFrame(__privateGet(this, _tick));
    });
    __publicField(this, "pause", () => {
      if (this.frameId === null) return;
      this.cancelFrame();
      this.pausedAtMs = currentTime();
    });
    __publicField(this, "stop", () => {
      if (this.frameId === null) return;
      this.cancelFrame();
      this.pausedAtMs = null;
    });
    __privateAdd(this, _tick, (now) => {
      this.context.now = now;
      this.context.deltaMs = now - this.context.startMs;
      const shouldContinue = this.onTick(this.context);
      if (shouldContinue === false) {
        this.stop();
        return;
      }
      this.frameId = requestAnimationFrame(__privateGet(this, _tick));
    });
    this.context = { now: 0, startMs: currentTime(), deltaMs: 0 };
  }
  get elapsedMs() {
    if (this.pausedAtMs !== null) {
      return this.pausedAtMs - this.context.startMs;
    }
    return currentTime() - this.context.startMs;
  }
};
_tick = new WeakMap();
function setRafInterval(fn, intervalMs) {
  const timer = new Timer(({ now, deltaMs }) => {
    if (deltaMs >= intervalMs) {
      const startMs = intervalMs > 0 ? now - deltaMs % intervalMs : now;
      timer.setStartMs(startMs);
      fn({ startMs, deltaMs });
    }
  });
  timer.start();
  return () => timer.stop();
}
function setRafTimeout(fn, delayMs) {
  const timer = new Timer(({ deltaMs }) => {
    if (deltaMs >= delayMs) {
      fn();
      return false;
    }
  });
  timer.start();
  return () => timer.stop();
}
export {
  Timer,
  setRafInterval,
  setRafTimeout
};
