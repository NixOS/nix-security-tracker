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

// src/utils/checked-state.ts
var checked_state_exports = {};
__export(checked_state_exports, {
  getCheckedState: () => getCheckedState,
  getCheckedValueMap: () => getCheckedValueMap,
  toggleBranchChecked: () => toggleBranchChecked
});
module.exports = __toCommonJS(checked_state_exports);
var import_utils = require("@zag-js/utils");
function getCheckedState(collection, node, checkedValue) {
  const value = collection.getNodeValue(node);
  if (!collection.isBranchNode(node)) {
    return checkedValue.includes(value);
  }
  const childValues = collection.getDescendantValues(value);
  const allChecked = childValues.every((v) => checkedValue.includes(v));
  const someChecked = childValues.some((v) => checkedValue.includes(v));
  return allChecked ? true : someChecked ? "indeterminate" : false;
}
function toggleBranchChecked(collection, value, checkedValue) {
  const childValues = collection.getDescendantValues(value);
  const allChecked = childValues.every((child) => checkedValue.includes(child));
  return (0, import_utils.uniq)(allChecked ? (0, import_utils.remove)(checkedValue, ...childValues) : (0, import_utils.add)(checkedValue, ...childValues));
}
function getCheckedValueMap(collection, checkedValue) {
  const map = /* @__PURE__ */ new Map();
  collection.visit({
    onEnter: (node) => {
      const value = collection.getNodeValue(node);
      const isBranch = collection.isBranchNode(node);
      const checked = getCheckedState(collection, node, checkedValue);
      map.set(value, {
        type: isBranch ? "branch" : "leaf",
        checked
      });
    }
  });
  return map;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getCheckedState,
  getCheckedValueMap,
  toggleBranchChecked
});
