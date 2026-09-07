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
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  anatomy: () => import_tour.anatomy,
  connect: () => import_tour2.connect,
  machine: () => import_tour3.machine
});
module.exports = __toCommonJS(index_exports);
var import_tour = require("./tour.anatomy.js");
var import_tour2 = require("./tour.connect.js");
var import_tour3 = require("./tour.machine.js");
__reExport(index_exports, require("./tour.props.js"), module.exports);
__reExport(index_exports, require("./utils/wait.js"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  anatomy,
  connect,
  machine,
  ...require("./tour.props.js"),
  ...require("./utils/wait.js")
});
