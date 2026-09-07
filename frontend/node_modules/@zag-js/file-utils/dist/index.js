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
__reExport(index_exports, require("./data-transfer.js"), module.exports);
__reExport(index_exports, require("./data-url-to-blob.js"), module.exports);
__reExport(index_exports, require("./download-file.js"), module.exports);
__reExport(index_exports, require("./get-accept-attr.js"), module.exports);
__reExport(index_exports, require("./get-file-data-url.js"), module.exports);
__reExport(index_exports, require("./get-total-file-size.js"), module.exports);
__reExport(index_exports, require("./is-file-equal.js"), module.exports);
__reExport(index_exports, require("./is-valid-file-size.js"), module.exports);
__reExport(index_exports, require("./is-valid-file-type.js"), module.exports);
__reExport(index_exports, require("./get-file-mime-type.js"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ...require("./data-transfer.js"),
  ...require("./data-url-to-blob.js"),
  ...require("./download-file.js"),
  ...require("./get-accept-attr.js"),
  ...require("./get-file-data-url.js"),
  ...require("./get-total-file-size.js"),
  ...require("./is-file-equal.js"),
  ...require("./is-valid-file-size.js"),
  ...require("./is-valid-file-type.js"),
  ...require("./get-file-mime-type.js")
});
