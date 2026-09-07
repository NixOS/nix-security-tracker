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
__reExport(index_exports, require("./merge-props.js"), module.exports);
__reExport(index_exports, require("./memo.js"), module.exports);
__reExport(index_exports, require("./create-machine.js"), module.exports);
__reExport(index_exports, require("./state.js"), module.exports);
__reExport(index_exports, require("./types.js"), module.exports);
__reExport(index_exports, require("./scope.js"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ...require("./merge-props.js"),
  ...require("./memo.js"),
  ...require("./create-machine.js"),
  ...require("./state.js"),
  ...require("./types.js"),
  ...require("./scope.js")
});
