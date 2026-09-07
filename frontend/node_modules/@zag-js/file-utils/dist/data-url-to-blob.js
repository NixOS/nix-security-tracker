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

// src/data-url-to-blob.ts
var data_url_to_blob_exports = {};
__export(data_url_to_blob_exports, {
  dataURItoBlob: () => dataURItoBlob
});
module.exports = __toCommonJS(data_url_to_blob_exports);
function dataURItoBlob(uri) {
  const binary = atob(uri.split(",")[1]);
  const mimeString = uri.split(",")[0].split(":")[1].split(";")[0];
  const buffer = new ArrayBuffer(binary.length);
  const intArray = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    intArray[i] = binary.charCodeAt(i);
  }
  return new Blob([buffer], { type: mimeString });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  dataURItoBlob
});
