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

// src/event.ts
var event_exports = {};
__export(event_exports, {
  addDomEvent: () => addDomEvent,
  getBeforeInputValue: () => getBeforeInputValue,
  getEventKey: () => getEventKey,
  getEventPoint: () => getEventPoint,
  getEventStep: () => getEventStep,
  getEventStepValue: () => getEventStepValue,
  getEventTarget: () => getEventTarget,
  getNativeEvent: () => getNativeEvent,
  isComposingEvent: () => isComposingEvent,
  isContextMenuEvent: () => isContextMenuEvent,
  isCtrlOrMetaKey: () => isCtrlOrMetaKey,
  isDownloadingEvent: () => isDownloadingEvent,
  isKeyboardClick: () => isKeyboardClick,
  isLeftClick: () => isLeftClick,
  isModifierKey: () => isModifierKey,
  isOpeningInNewTab: () => isOpeningInNewTab,
  isPrintableKey: () => isPrintableKey,
  isSelfTarget: () => isSelfTarget,
  isTouchEvent: () => isTouchEvent,
  isVirtualClick: () => isVirtualClick,
  isVirtualPointerEvent: () => isVirtualPointerEvent
});
module.exports = __toCommonJS(event_exports);
var import_platform = require("./platform.js");
function getBeforeInputValue(event) {
  const { selectionStart, selectionEnd, value } = event.currentTarget;
  const data = event.data;
  return value.slice(0, selectionStart) + (data ?? "") + value.slice(selectionEnd);
}
function getComposedPath(event) {
  return event.composedPath?.() ?? event.nativeEvent?.composedPath?.();
}
function getEventTarget(event) {
  const composedPath = getComposedPath(event);
  return composedPath?.[0] ?? event.target;
}
function isOpeningInNewTab(event) {
  const element = event.currentTarget;
  if (!element) return false;
  const validElement = element.matches("a[href], button[type='submit'], input[type='submit']");
  if (!validElement) return false;
  const isMiddleClick = event.button === 1;
  const isModKeyClick = isCtrlOrMetaKey(event);
  return isMiddleClick || isModKeyClick;
}
function isDownloadingEvent(event) {
  const element = event.currentTarget;
  if (!element) return false;
  const localName = element.localName;
  if (!event.altKey) return false;
  if (localName === "a") return true;
  if (localName === "button" && element.type === "submit") return true;
  if (localName === "input" && element.type === "submit") return true;
  return false;
}
function isComposingEvent(event) {
  return getNativeEvent(event).isComposing || event.keyCode === 229;
}
function isKeyboardClick(e) {
  return e.detail === 0 || e.clientX === 0 && e.clientY === 0;
}
function isCtrlOrMetaKey(e) {
  if ((0, import_platform.isMac)()) return e.metaKey;
  return e.ctrlKey;
}
function isPrintableKey(e) {
  return e.key.length === 1 && !e.ctrlKey && !e.metaKey;
}
function isVirtualPointerEvent(e) {
  return e.width === 0 && e.height === 0 || e.width === 1 && e.height === 1 && e.pressure === 0 && e.detail === 0 && e.pointerType === "mouse";
}
function isVirtualClick(e) {
  if (e.pointerType === "" && e.isTrusted) return true;
  if ((0, import_platform.isAndroid)() && e.pointerType) {
    return e.type === "click" && e.buttons === 1;
  }
  return e.detail === 0 && !e.pointerType;
}
var isLeftClick = (e) => e.button === 0;
var isContextMenuEvent = (e) => {
  return e.button === 2 || (0, import_platform.isMac)() && e.ctrlKey && e.button === 0;
};
var isModifierKey = (e) => e.ctrlKey || e.altKey || e.metaKey;
var isTouchEvent = (event) => "touches" in event && event.touches.length > 0;
var keyMap = {
  Up: "ArrowUp",
  Down: "ArrowDown",
  Esc: "Escape",
  " ": "Space",
  ",": "Comma",
  Left: "ArrowLeft",
  Right: "ArrowRight"
};
var rtlKeyMap = {
  ArrowLeft: "ArrowRight",
  ArrowRight: "ArrowLeft"
};
function getEventKey(event, options = {}) {
  const { dir = "ltr", orientation = "horizontal" } = options;
  let key = event.key;
  key = keyMap[key] ?? key;
  const isRtl = dir === "rtl" && orientation === "horizontal";
  if (isRtl && key in rtlKeyMap) key = rtlKeyMap[key];
  return key;
}
function getNativeEvent(event) {
  return event.nativeEvent ?? event;
}
var pageKeys = /* @__PURE__ */ new Set(["PageUp", "PageDown"]);
var arrowKeys = /* @__PURE__ */ new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
function getEventStep(event) {
  const isPageKey = pageKeys.has(event.key);
  const isSkipKey = isPageKey || event.shiftKey && arrowKeys.has(event.key);
  return isSkipKey ? 10 : 1;
}
function getEventStepValue(event, options) {
  const { step, largeStep, smallStep } = options;
  const isArrowKey = arrowKeys.has(event.key);
  if (smallStep != null && event.altKey && isArrowKey) {
    return smallStep;
  }
  const isLargeStep = pageKeys.has(event.key) || event.shiftKey && isArrowKey;
  return isLargeStep ? largeStep : step;
}
function getEventPoint(event, type = "client") {
  const point = isTouchEvent(event) ? event.touches[0] || event.changedTouches[0] : event;
  return { x: point[`${type}X`], y: point[`${type}Y`] };
}
var addDomEvent = (target, eventName, handler, options) => {
  const node = typeof target === "function" ? target() : target;
  node?.addEventListener(eventName, handler, options);
  return () => {
    node?.removeEventListener(eventName, handler, options);
  };
};
var isSelfTarget = (event) => {
  const composedPath = getComposedPath(event);
  const target = composedPath?.[0] ?? event.target;
  return event.currentTarget === target;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addDomEvent,
  getBeforeInputValue,
  getEventKey,
  getEventPoint,
  getEventStep,
  getEventStepValue,
  getEventTarget,
  getNativeEvent,
  isComposingEvent,
  isContextMenuEvent,
  isCtrlOrMetaKey,
  isDownloadingEvent,
  isKeyboardClick,
  isLeftClick,
  isModifierKey,
  isOpeningInNewTab,
  isPrintableKey,
  isSelfTarget,
  isTouchEvent,
  isVirtualClick,
  isVirtualPointerEvent
});
