"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
module.exports = __toCommonJS(index_exports);
__reExport(index_exports, require("./affine-transform.js"), module.exports);
__reExport(index_exports, require("./align.js"), module.exports);
__reExport(index_exports, require("./angle.js"), module.exports);
__reExport(index_exports, require("./clamp.js"), module.exports);
__reExport(index_exports, require("./closest.js"), module.exports);
__reExport(index_exports, require("./constrain.js"), module.exports);
__reExport(index_exports, require("./contains.js"), module.exports);
__reExport(index_exports, require("./distance.js"), module.exports);
__reExport(index_exports, require("./equality.js"), module.exports);
__reExport(index_exports, require("./from-element.js"), module.exports);
__reExport(index_exports, require("./from-points.js"), module.exports);
__reExport(index_exports, require("./from-range.js"), module.exports);
__reExport(index_exports, require("./from-rotation.js"), module.exports);
__reExport(index_exports, require("./from-window.js"), module.exports);
__reExport(index_exports, require("./intersection.js"), module.exports);
__reExport(index_exports, require("./operations.js"), module.exports);
__reExport(index_exports, require("./polygon.js"), module.exports);
__reExport(index_exports, require("./rect.js"), module.exports);
__reExport(index_exports, require("./resize.js"), module.exports);
__reExport(index_exports, require("./types.js"), module.exports);
__reExport(index_exports, require("./union.js"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ...require("./affine-transform.js"),
  ...require("./align.js"),
  ...require("./angle.js"),
  ...require("./clamp.js"),
  ...require("./closest.js"),
  ...require("./constrain.js"),
  ...require("./contains.js"),
  ...require("./distance.js"),
  ...require("./equality.js"),
  ...require("./from-element.js"),
  ...require("./from-points.js"),
  ...require("./from-range.js"),
  ...require("./from-rotation.js"),
  ...require("./from-window.js"),
  ...require("./intersection.js"),
  ...require("./operations.js"),
  ...require("./polygon.js"),
  ...require("./rect.js"),
  ...require("./resize.js"),
  ...require("./types.js"),
  ...require("./union.js")
});
