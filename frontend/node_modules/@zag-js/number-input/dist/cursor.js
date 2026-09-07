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

// src/cursor.ts
var cursor_exports = {};
__export(cursor_exports, {
  getNextCursorPosition: () => getNextCursorPosition,
  recordCursor: () => recordCursor,
  restoreCursor: () => restoreCursor
});
module.exports = __toCommonJS(cursor_exports);
function recordCursor(inputEl, scope) {
  if (!inputEl || !scope.isActiveElement(inputEl)) return;
  try {
    const { selectionStart: start, selectionEnd: end, value } = inputEl;
    if (start == null || end == null) return void 0;
    return { start, end, value };
  } catch {
    return void 0;
  }
}
function restoreCursor(inputEl, selection, scope) {
  if (!inputEl || !scope.isActiveElement(inputEl)) return;
  if (!selection) {
    const len = inputEl.value.length;
    inputEl.setSelectionRange(len, len);
    return;
  }
  try {
    const newValue = inputEl.value;
    const { start, end, value: oldValue } = selection;
    if (newValue === oldValue) {
      inputEl.setSelectionRange(start, end);
      return;
    }
    const newStart = getNextCursorPosition(oldValue, newValue, start);
    const newEnd = start === end ? newStart : getNextCursorPosition(oldValue, newValue, end);
    const clampedStart = Math.max(0, Math.min(newStart, newValue.length));
    const clampedEnd = Math.max(clampedStart, Math.min(newEnd, newValue.length));
    inputEl.setSelectionRange(clampedStart, clampedEnd);
  } catch {
    const len = inputEl.value.length;
    inputEl.setSelectionRange(len, len);
  }
}
function getNextCursorPosition(oldValue, newValue, oldPosition) {
  const beforeCursor = oldValue.slice(0, oldPosition);
  const afterCursor = oldValue.slice(oldPosition);
  let prefixLength = 0;
  const maxPrefixLength = Math.min(beforeCursor.length, newValue.length);
  for (let i = 0; i < maxPrefixLength; i++) {
    if (beforeCursor[i] === newValue[i]) {
      prefixLength = i + 1;
    } else {
      break;
    }
  }
  let suffixLength = 0;
  const maxSuffixLength = Math.min(afterCursor.length, newValue.length - prefixLength);
  for (let i = 0; i < maxSuffixLength; i++) {
    const oldIndex = afterCursor.length - 1 - i;
    const newIndex = newValue.length - 1 - i;
    if (afterCursor[oldIndex] === newValue[newIndex]) {
      suffixLength = i + 1;
    } else {
      break;
    }
  }
  if (beforeCursor.length > 0 && prefixLength >= beforeCursor.length) {
    return prefixLength;
  }
  if (suffixLength >= afterCursor.length) {
    return newValue.length - suffixLength;
  }
  if (prefixLength > 0) {
    return prefixLength;
  }
  if (suffixLength > 0) {
    return newValue.length - suffixLength;
  }
  if (oldPosition === 0 && prefixLength === 0 && suffixLength === 0) {
    return newValue.length;
  }
  if (oldValue.length > 0) {
    const ratio = oldPosition / oldValue.length;
    return Math.round(ratio * newValue.length);
  }
  return newValue.length;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getNextCursorPosition,
  recordCursor,
  restoreCursor
});
