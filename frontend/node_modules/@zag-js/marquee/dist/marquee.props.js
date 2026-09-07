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

// src/marquee.props.ts
var marquee_props_exports = {};
__export(marquee_props_exports, {
  props: () => props,
  splitProps: () => splitProps
});
module.exports = __toCommonJS(marquee_props_exports);
var import_types = require("@zag-js/types");
var import_utils = require("@zag-js/utils");
var props = (0, import_types.createProps)()([
  "autoFill",
  "defaultPaused",
  "delay",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "loopCount",
  "onComplete",
  "onLoopComplete",
  "onPauseChange",
  "paused",
  "pauseOnInteraction",
  "reverse",
  "side",
  "spacing",
  "speed",
  "translations"
]);
var splitProps = (0, import_utils.createSplitProps)(props);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  props,
  splitProps
});
