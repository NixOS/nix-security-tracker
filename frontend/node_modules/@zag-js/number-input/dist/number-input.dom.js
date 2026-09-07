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

// src/number-input.dom.ts
var number_input_dom_exports = {};
__export(number_input_dom_exports, {
  createVirtualCursor: () => createVirtualCursor,
  getCursorEl: () => getCursorEl,
  getCursorId: () => getCursorId,
  getDecrementTriggerEl: () => getDecrementTriggerEl,
  getDecrementTriggerId: () => getDecrementTriggerId,
  getIncrementTriggerEl: () => getIncrementTriggerEl,
  getIncrementTriggerId: () => getIncrementTriggerId,
  getInputEl: () => getInputEl,
  getInputId: () => getInputId,
  getLabelId: () => getLabelId,
  getMousemoveValue: () => getMousemoveValue,
  getPressedTriggerEl: () => getPressedTriggerEl,
  getRootId: () => getRootId,
  getScrubberEl: () => getScrubberEl,
  getScrubberId: () => getScrubberId,
  preventTextSelection: () => preventTextSelection,
  setupVirtualCursor: () => setupVirtualCursor
});
module.exports = __toCommonJS(number_input_dom_exports);
var import_dom_query = require("@zag-js/dom-query");
var import_utils = require("@zag-js/utils");
var getRootId = (ctx) => ctx.ids?.root ?? `number-input:${ctx.id}`;
var getInputId = (ctx) => ctx.ids?.input ?? `number-input:${ctx.id}:input`;
var getIncrementTriggerId = (ctx) => ctx.ids?.incrementTrigger ?? `number-input:${ctx.id}:inc`;
var getDecrementTriggerId = (ctx) => ctx.ids?.decrementTrigger ?? `number-input:${ctx.id}:dec`;
var getScrubberId = (ctx) => ctx.ids?.scrubber ?? `number-input:${ctx.id}:scrubber`;
var getCursorId = (ctx) => `number-input:${ctx.id}:cursor`;
var getLabelId = (ctx) => ctx.ids?.label ?? `number-input:${ctx.id}:label`;
var getInputEl = (ctx) => ctx.getById(getInputId(ctx));
var getIncrementTriggerEl = (ctx) => ctx.getById(getIncrementTriggerId(ctx));
var getDecrementTriggerEl = (ctx) => ctx.getById(getDecrementTriggerId(ctx));
var getScrubberEl = (ctx) => ctx.getById(getScrubberId(ctx));
var getCursorEl = (ctx) => ctx.getDoc().getElementById(getCursorId(ctx));
var getPressedTriggerEl = (ctx, hint) => {
  let btnEl = null;
  if (hint === "increment") {
    btnEl = getIncrementTriggerEl(ctx);
  }
  if (hint === "decrement") {
    btnEl = getDecrementTriggerEl(ctx);
  }
  return btnEl;
};
var setupVirtualCursor = (ctx, point) => {
  if ((0, import_dom_query.isSafari)()) return;
  createVirtualCursor(ctx, point);
  return () => {
    getCursorEl(ctx)?.remove();
  };
};
var preventTextSelection = (ctx) => {
  const doc = ctx.getDoc();
  const html = doc.documentElement;
  const body = doc.body;
  body.style.pointerEvents = "none";
  html.style.userSelect = "none";
  html.style.cursor = "ew-resize";
  return () => {
    body.style.pointerEvents = "";
    html.style.userSelect = "";
    html.style.cursor = "";
    if (!html.style.length) {
      html.removeAttribute("style");
    }
    if (!body.style.length) {
      body.removeAttribute("style");
    }
  };
};
var getMousemoveValue = (ctx, opts) => {
  const { point, isRtl, event } = opts;
  const win = ctx.getWin();
  const x = (0, import_utils.roundToDpr)(event.movementX, win.devicePixelRatio);
  const y = (0, import_utils.roundToDpr)(event.movementY, win.devicePixelRatio);
  let hint = x > 0 ? "increment" : x < 0 ? "decrement" : null;
  if (isRtl && hint === "increment") hint = "decrement";
  if (isRtl && hint === "decrement") hint = "increment";
  const newPoint = { x: point.x + x, y: point.y + y };
  const width = win.innerWidth;
  const half = (0, import_utils.roundToDpr)(7.5, win.devicePixelRatio);
  newPoint.x = (0, import_utils.wrap)(newPoint.x + half, width) - half;
  return { hint, point: newPoint };
};
var createVirtualCursor = (ctx, point) => {
  const doc = ctx.getDoc();
  const el = doc.createElement("div");
  el.className = "scrubber--cursor";
  el.id = getCursorId(ctx);
  Object.assign(el.style, {
    width: "15px",
    height: "15px",
    position: "fixed",
    pointerEvents: "none",
    left: "0px",
    top: "0px",
    zIndex: import_dom_query.MAX_Z_INDEX,
    transform: point ? `translate3d(${point.x}px, ${point.y}px, 0px)` : void 0,
    willChange: "transform"
  });
  el.innerHTML = `
      <svg width="46" height="15" style="left: -15.5px; position: absolute; top: 0; filter: drop-shadow(rgba(0, 0, 0, 0.4) 0px 1px 1.1px);">
        <g transform="translate(2 3)">
          <path fill-rule="evenodd" d="M 15 4.5L 15 2L 11.5 5.5L 15 9L 15 6.5L 31 6.5L 31 9L 34.5 5.5L 31 2L 31 4.5Z" style="stroke-width: 2px; stroke: white;"></path>
          <path fill-rule="evenodd" d="M 15 4.5L 15 2L 11.5 5.5L 15 9L 15 6.5L 31 6.5L 31 9L 34.5 5.5L 31 2L 31 4.5Z"></path>
        </g>
      </svg>`;
  doc.body.appendChild(el);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createVirtualCursor,
  getCursorEl,
  getCursorId,
  getDecrementTriggerEl,
  getDecrementTriggerId,
  getIncrementTriggerEl,
  getIncrementTriggerId,
  getInputEl,
  getInputId,
  getLabelId,
  getMousemoveValue,
  getPressedTriggerEl,
  getRootId,
  getScrubberEl,
  getScrubberId,
  preventTextSelection,
  setupVirtualCursor
});
