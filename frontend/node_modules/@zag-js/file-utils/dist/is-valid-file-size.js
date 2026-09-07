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

// src/is-valid-file-size.ts
var is_valid_file_size_exports = {};
__export(is_valid_file_size_exports, {
  isValidFileSize: () => isValidFileSize
});
module.exports = __toCommonJS(is_valid_file_size_exports);
var isDefined = (v) => v !== void 0 && v !== null;
function isValidFileSize(file, minSize, maxSize) {
  if (isDefined(file.size)) {
    if (isDefined(minSize) && isDefined(maxSize)) {
      if (file.size > maxSize) return [false, "FILE_TOO_LARGE"];
      if (file.size < minSize) return [false, "FILE_TOO_SMALL"];
    } else if (isDefined(minSize) && file.size < minSize) {
      return [false, "FILE_TOO_SMALL"];
    } else if (isDefined(maxSize) && file.size > maxSize) {
      return [false, "FILE_TOO_LARGE"];
    }
  }
  return [true, null];
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isValidFileSize
});
