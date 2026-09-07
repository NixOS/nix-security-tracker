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

// src/is-valid-file-type.ts
var is_valid_file_type_exports = {};
__export(is_valid_file_type_exports, {
  isValidFileType: () => isValidFileType
});
module.exports = __toCommonJS(is_valid_file_type_exports);
var import_get_file_mime_type = require("./get-file-mime-type.js");
function isFileAccepted(file, accept) {
  if (file && accept) {
    const types = Array.isArray(accept) ? accept : typeof accept === "string" ? accept.split(",") : [];
    if (types.length === 0) return true;
    const fileName = file.name || "";
    const mimeType = (file.type || (0, import_get_file_mime_type.getFileMimeType)(fileName) || "").toLowerCase();
    const baseMimeType = mimeType.replace(/\/.*$/, "");
    return types.some((type) => {
      const validType = type.trim().toLowerCase();
      if (validType.charAt(0) === ".") {
        return fileName.toLowerCase().endsWith(validType);
      }
      if (validType.endsWith("/*")) {
        return baseMimeType === validType.replace(/\/.*$/, "");
      }
      return mimeType === validType;
    });
  }
  return true;
}
function isValidFileType(file, accept) {
  const isAcceptable = file.type === "application/x-moz-file" || isFileAccepted(file, accept);
  return [isAcceptable, isAcceptable ? null : "FILE_INVALID_TYPE"];
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isValidFileType
});
