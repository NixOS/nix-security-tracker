"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/pointer-lock.ts
var pointer_lock_exports = {};
__export(pointer_lock_exports, {
  requestPointerLock: () => requestPointerLock
});
module.exports = __toCommonJS(pointer_lock_exports);
var import_event = require("./event.js");
function requestPointerLock(doc, fn) {
  const body = doc.body;
  const supported = "pointerLockElement" in doc || "mozPointerLockElement" in doc;
  const isLocked = () => !!doc.pointerLockElement;
  function onPointerChange() {
    fn?.(isLocked());
  }
  function onPointerError(event) {
    if (isLocked()) fn?.(false);
    console.error("PointerLock error occurred:", event);
    doc.exitPointerLock();
  }
  if (!supported) return;
  try {
    body.requestPointerLock();
  } catch {
  }
  const cleanup = [
    (0, import_event.addDomEvent)(doc, "pointerlockchange", onPointerChange, false),
    (0, import_event.addDomEvent)(doc, "pointerlockerror", onPointerError, false)
  ];
  return () => {
    cleanup.forEach((cleanup2) => cleanup2());
    doc.exitPointerLock();
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  requestPointerLock
});
