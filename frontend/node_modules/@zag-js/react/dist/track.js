"use strict";
"use client";
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

// src/track.ts
var track_exports = {};
__export(track_exports, {
  useTrack: () => useTrack
});
module.exports = __toCommonJS(track_exports);
var import_react = require("react");
var useTrack = (deps, effect) => {
  const render = (0, import_react.useRef)(false);
  const called = (0, import_react.useRef)(false);
  (0, import_react.useEffect)(() => {
    const mounted = render.current;
    const run = mounted && called.current;
    if (run) return effect();
    called.current = true;
  }, [...(deps ?? []).map((d) => typeof d === "function" ? d() : d)]);
  (0, import_react.useEffect)(() => {
    render.current = true;
    return () => {
      render.current = false;
    };
  }, []);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useTrack
});
