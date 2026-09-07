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

// src/is-file-equal.ts
var is_file_equal_exports = {};
__export(is_file_equal_exports, {
  isFileEqual: () => isFileEqual
});
module.exports = __toCommonJS(is_file_equal_exports);
var isFileEqual = (file1, file2) => {
  return file1.name === file2.name && file1.size === file2.size && file1.type === file2.type;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isFileEqual
});
