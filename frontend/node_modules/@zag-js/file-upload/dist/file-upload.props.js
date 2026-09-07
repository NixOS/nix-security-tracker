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

// src/file-upload.props.ts
var file_upload_props_exports = {};
__export(file_upload_props_exports, {
  itemProps: () => itemProps,
  props: () => props,
  splitItemProps: () => splitItemProps,
  splitProps: () => splitProps
});
module.exports = __toCommonJS(file_upload_props_exports);
var import_types = require("@zag-js/types");
var import_utils = require("@zag-js/utils");
var props = (0, import_types.createProps)()([
  "accept",
  "acceptedFiles",
  "allowDrop",
  "capture",
  "defaultAcceptedFiles",
  "dir",
  "directory",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "invalid",
  "locale",
  "maxFiles",
  "maxFileSize",
  "minFileSize",
  "name",
  "onFileAccept",
  "onFileChange",
  "onFileReject",
  "preventDocumentDrop",
  "readOnly",
  "required",
  "transformFiles",
  "translations",
  "validate"
]);
var splitProps = (0, import_utils.createSplitProps)(props);
var itemProps = (0, import_types.createProps)()(["file", "type"]);
var splitItemProps = (0, import_utils.createSplitProps)(itemProps);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  itemProps,
  props,
  splitItemProps,
  splitProps
});
