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
  MAX_Z_INDEX: () => import_shared.MAX_Z_INDEX,
  ariaAttr: () => import_shared.ariaAttr,
  dataAttr: () => import_shared.dataAttr,
  getByOwnerId: () => import_shared.getByOwnerId,
  isOwnedBy: () => import_shared.isOwnedBy
});
module.exports = __toCommonJS(index_exports);
__reExport(index_exports, require("./caret.js"), module.exports);
__reExport(index_exports, require("./computed-style.js"), module.exports);
__reExport(index_exports, require("./controller.js"), module.exports);
__reExport(index_exports, require("./data-url.js"), module.exports);
__reExport(index_exports, require("./event.js"), module.exports);
__reExport(index_exports, require("./form.js"), module.exports);
__reExport(index_exports, require("./initial-focus.js"), module.exports);
__reExport(index_exports, require("./mutation-observer.js"), module.exports);
__reExport(index_exports, require("./navigate.js"), module.exports);
__reExport(index_exports, require("./node.js"), module.exports);
__reExport(index_exports, require("./overflow.js"), module.exports);
__reExport(index_exports, require("./platform.js"), module.exports);
__reExport(index_exports, require("./point.js"), module.exports);
__reExport(index_exports, require("./pointer-lock.js"), module.exports);
__reExport(index_exports, require("./pointer-move.js"), module.exports);
__reExport(index_exports, require("./press.js"), module.exports);
__reExport(index_exports, require("./proxy-tab-focus.js"), module.exports);
__reExport(index_exports, require("./query.js"), module.exports);
__reExport(index_exports, require("./raf.js"), module.exports);
__reExport(index_exports, require("./resize-observer.js"), module.exports);
__reExport(index_exports, require("./scale.js"), module.exports);
__reExport(index_exports, require("./scope.js"), module.exports);
__reExport(index_exports, require("./scroll.js"), module.exports);
__reExport(index_exports, require("./searchable.js"), module.exports);
__reExport(index_exports, require("./set.js"), module.exports);
var import_shared = require("./shared.js");
__reExport(index_exports, require("./tabbable.js"), module.exports);
__reExport(index_exports, require("./text-selection.js"), module.exports);
__reExport(index_exports, require("./typeahead.js"), module.exports);
__reExport(index_exports, require("./visual-viewport.js"), module.exports);
__reExport(index_exports, require("./visually-hidden.js"), module.exports);
__reExport(index_exports, require("./wait-for.js"), module.exports);
__reExport(index_exports, require("./when-node.js"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MAX_Z_INDEX,
  ariaAttr,
  dataAttr,
  getByOwnerId,
  isOwnedBy,
  ...require("./caret.js"),
  ...require("./computed-style.js"),
  ...require("./controller.js"),
  ...require("./data-url.js"),
  ...require("./event.js"),
  ...require("./form.js"),
  ...require("./initial-focus.js"),
  ...require("./mutation-observer.js"),
  ...require("./navigate.js"),
  ...require("./node.js"),
  ...require("./overflow.js"),
  ...require("./platform.js"),
  ...require("./point.js"),
  ...require("./pointer-lock.js"),
  ...require("./pointer-move.js"),
  ...require("./press.js"),
  ...require("./proxy-tab-focus.js"),
  ...require("./query.js"),
  ...require("./raf.js"),
  ...require("./resize-observer.js"),
  ...require("./scale.js"),
  ...require("./scope.js"),
  ...require("./scroll.js"),
  ...require("./searchable.js"),
  ...require("./set.js"),
  ...require("./tabbable.js"),
  ...require("./text-selection.js"),
  ...require("./typeahead.js"),
  ...require("./visual-viewport.js"),
  ...require("./visually-hidden.js"),
  ...require("./wait-for.js"),
  ...require("./when-node.js")
});
