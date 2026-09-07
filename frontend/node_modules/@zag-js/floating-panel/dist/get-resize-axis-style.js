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

// src/get-resize-axis-style.ts
var get_resize_axis_style_exports = {};
__export(get_resize_axis_style_exports, {
  getResizeAxisStyle: () => getResizeAxisStyle
});
module.exports = __toCommonJS(get_resize_axis_style_exports);
function getResizeAxisStyle(axis) {
  switch (axis) {
    case "n":
      return {
        cursor: "n-resize",
        width: "100%",
        top: 0,
        left: "50%",
        translate: "-50%"
      };
    case "e":
      return {
        cursor: "e-resize",
        height: "100%",
        right: 0,
        top: "50%",
        translate: "0 -50%"
      };
    case "s":
      return {
        cursor: "s-resize",
        width: "100%",
        bottom: 0,
        left: "50%",
        translate: "-50%"
      };
    case "w":
      return {
        cursor: "w-resize",
        height: "100%",
        left: 0,
        top: "50%",
        translate: "0 -50%"
      };
    case "se":
      return {
        cursor: "se-resize",
        bottom: 0,
        right: 0
      };
    case "sw":
      return {
        cursor: "sw-resize",
        bottom: 0,
        left: 0
      };
    case "ne":
      return {
        cursor: "ne-resize",
        top: 0,
        right: 0
      };
    case "nw":
      return {
        cursor: "nw-resize",
        top: 0,
        left: 0
      };
    default:
      throw new Error(`Invalid axis: ${axis}`);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getResizeAxisStyle
});
