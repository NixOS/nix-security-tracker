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
  anatomy: () => import_hover_card.anatomy,
  connect: () => import_hover_card2.connect,
  machine: () => import_hover_card3.machine
});
module.exports = __toCommonJS(index_exports);
var import_hover_card = require("./hover-card.anatomy.js");
var import_hover_card2 = require("./hover-card.connect.js");
var import_hover_card3 = require("./hover-card.machine.js");
__reExport(index_exports, require("./hover-card.props.js"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  anatomy,
  connect,
  machine,
  ...require("./hover-card.props.js")
});
