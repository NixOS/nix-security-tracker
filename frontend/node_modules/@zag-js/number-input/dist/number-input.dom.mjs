// src/number-input.dom.ts
import { isSafari, MAX_Z_INDEX } from "@zag-js/dom-query";
import { roundToDpr, wrap } from "@zag-js/utils";
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
  if (isSafari()) return;
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
  const x = roundToDpr(event.movementX, win.devicePixelRatio);
  const y = roundToDpr(event.movementY, win.devicePixelRatio);
  let hint = x > 0 ? "increment" : x < 0 ? "decrement" : null;
  if (isRtl && hint === "increment") hint = "decrement";
  if (isRtl && hint === "decrement") hint = "increment";
  const newPoint = { x: point.x + x, y: point.y + y };
  const width = win.innerWidth;
  const half = roundToDpr(7.5, win.devicePixelRatio);
  newPoint.x = wrap(newPoint.x + half, width) - half;
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
    zIndex: MAX_Z_INDEX,
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
export {
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
};
