"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/utils/timeout.ts
var timeout_exports = {};
__export(timeout_exports, {
  Timeout: () => Timeout
});
module.exports = __toCommonJS(timeout_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Timeout
});
