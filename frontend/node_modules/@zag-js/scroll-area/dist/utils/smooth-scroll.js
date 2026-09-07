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

// src/utils/smooth-scroll.ts
var smooth_scroll_exports = {};
__export(smooth_scroll_exports, {
  smoothScroll: () => smoothScroll
});
module.exports = __toCommonJS(smooth_scroll_exports);
var DURATION = 300;
var EASE_OUT_QUAD = (t) => t * (2 - t);
function smoothScroll(node, options = {}) {
  const { top, left, duration = DURATION, easing = EASE_OUT_QUAD, onComplete } = options;
  if (!node) return;
  const state = {
    startTime: 0,
    startScrollTop: node.scrollTop,
    startScrollLeft: node.scrollLeft,
    targetScrollTop: top ?? node.scrollTop,
    targetScrollLeft: left ?? node.scrollLeft
  };
  let cancelled = false;
  const cleanup = () => {
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = void 0;
    }
    cancelled = true;
  };
  const animate = (currentTime) => {
    if (cancelled) return;
    if (state.startTime === 0) {
      state.startTime = currentTime;
    }
    const elapsed = currentTime - state.startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);
    const deltaTop = state.targetScrollTop - state.startScrollTop;
    const deltaLeft = state.targetScrollLeft - state.startScrollLeft;
    node.scrollTop = state.startScrollTop + deltaTop * easedProgress;
    node.scrollLeft = state.startScrollLeft + deltaLeft * easedProgress;
    if (progress < 1) {
      state.rafId = requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  };
  state.rafId = requestAnimationFrame(animate);
  return cleanup;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  smoothScroll
});
