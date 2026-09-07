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

// src/toast.anatomy.ts
var toast_anatomy_exports = {};
__export(toast_anatomy_exports, {
  anatomy: () => anatomy,
  parts: () => parts
});
module.exports = __toCommonJS(toast_anatomy_exports);
var import_anatomy = require("@zag-js/anatomy");
var anatomy = (0, import_anatomy.createAnatomy)("toast").parts(
  "group",
  "root",
  "title",
  "description",
  "actionTrigger",
  "closeTrigger"
);
var parts = anatomy.build();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  anatomy,
  parts
});
