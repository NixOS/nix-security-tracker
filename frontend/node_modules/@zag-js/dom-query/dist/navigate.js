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

// src/navigate.ts
var navigate_exports = {};
__export(navigate_exports, {
  clickIfLink: () => clickIfLink,
  navigate: () => navigate
});
module.exports = __toCommonJS(navigate_exports);
var import_node = require("./node.js");
var import_platform = require("./platform.js");
var import_raf = require("./raf.js");
function navigate(items, current, options = {}) {
  if (!current) return null;
  const { orientation = "both", loop = true, dir = "ltr", key } = options;
  if (!items.length || !key) return null;
  const isVertical = key === "ArrowUp" || key === "ArrowDown";
  const isHorizontal = key === "ArrowLeft" || key === "ArrowRight";
  if (!isVertical && !isHorizontal && key !== "Home" && key !== "End") return null;
  if (orientation === "vertical" && isHorizontal || orientation === "horizontal" && isVertical) return null;
  if (key === "Home") return items[0] || null;
  if (key === "End") return items[items.length - 1] || null;
  const idx = items.indexOf(current);
  if (idx === -1) return null;
  let isForward;
  if (orientation === "both") {
    isForward = key === "ArrowDown" || (dir === "ltr" ? key === "ArrowRight" : key === "ArrowLeft");
  } else {
    isForward = isVertical ? key === "ArrowDown" : dir === "ltr" ? key === "ArrowRight" : key === "ArrowLeft";
  }
  const nextIdx = isForward ? loop ? (idx + 1) % items.length : Math.min(idx + 1, items.length - 1) : loop ? (idx - 1 + items.length) % items.length : Math.max(0, idx - 1);
  return items[nextIdx] || null;
}
function clickIfLink(el) {
  const click = () => {
    const win = (0, import_node.getWindow)(el);
    el.dispatchEvent(new win.MouseEvent("click"));
  };
  if ((0, import_platform.isFirefox)()) {
    (0, import_raf.queueBeforeEvent)(el, "keyup", click);
  } else {
    queueMicrotask(click);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  clickIfLink,
  navigate
});
