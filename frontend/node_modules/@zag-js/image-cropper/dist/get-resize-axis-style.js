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
  getHandlePositionStyles: () => getHandlePositionStyles
});
module.exports = __toCommonJS(get_resize_axis_style_exports);
function getHandlePositionStyles(handlePosition) {
  switch (handlePosition) {
    case "n":
      return {
        position: "absolute",
        cursor: "n-resize",
        width: "96%",
        top: 0,
        left: "50%",
        translate: "-50% -50%"
      };
    case "e":
      return {
        position: "absolute",
        cursor: "e-resize",
        height: "96%",
        right: 0,
        top: "50%",
        translate: "50% -50%"
      };
    case "s":
      return {
        position: "absolute",
        cursor: "s-resize",
        width: "96%",
        bottom: 0,
        left: "50%",
        translate: "-50% 50%"
      };
    case "w":
      return {
        position: "absolute",
        cursor: "w-resize",
        height: "96%",
        left: 0,
        top: "50%",
        translate: "-50% -50%"
      };
    case "se":
      return {
        position: "absolute",
        cursor: "se-resize",
        bottom: 0,
        right: 0,
        translate: "50% 50%"
      };
    case "sw":
      return {
        position: "absolute",
        cursor: "sw-resize",
        bottom: 0,
        left: 0,
        translate: "-50% 50%"
      };
    case "ne":
      return {
        position: "absolute",
        cursor: "ne-resize",
        top: 0,
        right: 0,
        translate: "50% -50%"
      };
    case "nw":
      return {
        position: "absolute",
        cursor: "nw-resize",
        top: 0,
        left: 0,
        translate: "-50% -50%"
      };
    default:
      throw new Error(`Invalid handlePosition: ${handlePosition}`);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getHandlePositionStyles
});
