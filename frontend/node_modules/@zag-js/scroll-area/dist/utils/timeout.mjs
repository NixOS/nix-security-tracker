import {
  __publicField
} from "../chunk-QZ7TP4HQ.mjs";

// src/utils/timeout.ts
var EMPTY = 0;
var Timeout = class {
  constructor() {
    __publicField(this, "currentId", EMPTY);
    __publicField(this, "clear", () => {
      if (this.currentId !== EMPTY) {
        clearTimeout(this.currentId);
        this.currentId = EMPTY;
      }
    });
    __publicField(this, "disposeEffect", () => {
      return this.clear;
    });
  }
  start(delay, fn) {
    this.clear();
    this.currentId = setTimeout(() => {
      this.currentId = EMPTY;
      fn();
    }, delay);
  }
  isStarted() {
    return this.currentId !== EMPTY;
  }
};
export {
  Timeout
};
