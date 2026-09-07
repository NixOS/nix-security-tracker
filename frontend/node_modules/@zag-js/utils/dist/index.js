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
__reExport(index_exports, require("./array.js"), module.exports);
__reExport(index_exports, require("./equal.js"), module.exports);
__reExport(index_exports, require("./functions.js"), module.exports);
__reExport(index_exports, require("./guard.js"), module.exports);
__reExport(index_exports, require("./number.js"), module.exports);
__reExport(index_exports, require("./object.js"), module.exports);
__reExport(index_exports, require("./store.js"), module.exports);
__reExport(index_exports, require("./timers.js"), module.exports);
__reExport(index_exports, require("./warning.js"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ...require("./array.js"),
  ...require("./equal.js"),
  ...require("./functions.js"),
  ...require("./guard.js"),
  ...require("./number.js"),
  ...require("./object.js"),
  ...require("./store.js"),
  ...require("./timers.js"),
  ...require("./warning.js")
});
