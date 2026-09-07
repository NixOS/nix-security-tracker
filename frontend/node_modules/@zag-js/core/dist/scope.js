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

// src/scope.ts
var scope_exports = {};
__export(scope_exports, {
  createScope: () => createScope
});
module.exports = __toCommonJS(scope_exports);
var import_dom_query = require("@zag-js/dom-query");
function createScope(props) {
  const getRootNode = () => props.getRootNode?.() ?? document;
  const getDoc = () => (0, import_dom_query.getDocument)(getRootNode());
  const getWin = () => getDoc().defaultView ?? window;
  const getActiveElementFn = () => (0, import_dom_query.getActiveElement)(getRootNode());
  const getById = (id) => getRootNode().getElementById(id);
  return {
    ...props,
    getRootNode,
    getDoc,
    getWin,
    getActiveElement: getActiveElementFn,
    isActiveElement: import_dom_query.isActiveElement,
    getById
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createScope
});
