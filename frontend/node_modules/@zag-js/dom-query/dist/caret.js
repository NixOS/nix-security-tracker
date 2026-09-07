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

// src/caret.ts
var caret_exports = {};
__export(caret_exports, {
  isCaretAtStart: () => isCaretAtStart,
  setCaretToEnd: () => setCaretToEnd
});
module.exports = __toCommonJS(caret_exports);
function isCaretAtStart(input) {
  if (!input) return false;
  try {
    return input.selectionStart === 0 && input.selectionEnd === 0;
  } catch {
    return input.value === "";
  }
}
function setCaretToEnd(input) {
  if (!input) return;
  try {
    if (input.ownerDocument.activeElement !== input) return;
    const len = input.value.length;
    input.setSelectionRange(len, len);
  } catch {
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isCaretAtStart,
  setCaretToEnd
});
