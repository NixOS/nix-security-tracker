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

// src/download-file.ts
var download_file_exports = {};
__export(download_file_exports, {
  downloadFile: () => downloadFile
});
module.exports = __toCommonJS(download_file_exports);
var BOM_REGEX = /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i;
var MAC_REGEX = /Macintosh/;
var APPLE_WEBKIT_REGEX = /AppleWebKit/;
var SAFARI_REGEX = /Safari/;
function getBlob(blobOrString, type, appendBOM) {
  let blob = typeof blobOrString === "string" ? new Blob([blobOrString], { type }) : blobOrString;
  if (appendBOM && BOM_REGEX.test(blob.type)) {
    return new Blob([String.fromCharCode(65279), blob], { type: blob.type });
  }
  return blob;
}
function isMSEdge(win) {
  return Boolean(win.navigator && win.navigator.msSaveOrOpenBlob);
}
function isWebView(win) {
  return win.navigator && MAC_REGEX.test(win.navigator.userAgent) && APPLE_WEBKIT_REGEX.test(win.navigator.userAgent) && !SAFARI_REGEX.test(win.navigator.userAgent);
}
function downloadFile(options) {
  const { file, win = window, type, name, appendBOM, revokeTimeout = 0 } = options;
  const doc = win.document;
  const blob = getBlob(file, type, appendBOM);
  const fileName = (file instanceof File ? name || file.name : name) || "file-download";
  if (isMSEdge(win)) {
    win.navigator.msSaveOrOpenBlob(blob, fileName);
    return;
  }
  const isMacOSWebView = isWebView(win);
  const anchor = doc.createElement("a");
  const canUseDownload = "download" in anchor && !isMacOSWebView;
  if (canUseDownload) {
    const url2 = win.URL.createObjectURL(blob);
    anchor.href = url2;
    anchor.rel = "noopener";
    anchor.download = fileName;
    anchor.style.display = "none";
    doc.body.appendChild(anchor);
    anchor.dispatchEvent(new win.MouseEvent("click"));
    setTimeout(() => {
      win.URL.revokeObjectURL(url2);
      anchor.remove();
    }, revokeTimeout);
    return;
  }
  const url = win.URL.createObjectURL(blob);
  const popup = win.open(url, "_blank");
  if (!popup) {
    win.location.href = url;
  }
  setTimeout(() => {
    win.URL.revokeObjectURL(url);
  }, revokeTimeout);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  downloadFile
});
