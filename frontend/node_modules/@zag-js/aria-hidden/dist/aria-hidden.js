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

// src/aria-hidden.ts
var aria_hidden_exports = {};
__export(aria_hidden_exports, {
  hideOthers: () => hideOthers,
  inertOthers: () => inertOthers,
  suppressOthers: () => suppressOthers
});
module.exports = __toCommonJS(aria_hidden_exports);
var import_walk_tree_outside = require("./walk-tree-outside.js");
var getParentNode = (originalTarget) => {
  const target = Array.isArray(originalTarget) ? originalTarget[0] : originalTarget;
  return target.ownerDocument.body;
};
var hideOthers = (originalTarget, parentNode = getParentNode(originalTarget), markerName = "data-aria-hidden", followControlledElements = true) => {
  if (!parentNode) return;
  return (0, import_walk_tree_outside.walkTreeOutside)(originalTarget, {
    parentNode,
    markerName,
    controlAttribute: "aria-hidden",
    explicitBooleanValue: true,
    followControlledElements
  });
};
var inertOthers = (originalTarget, parentNode = getParentNode(originalTarget), markerName = "data-inerted", followControlledElements = true) => {
  if (!parentNode) return;
  return (0, import_walk_tree_outside.walkTreeOutside)(originalTarget, {
    parentNode,
    markerName,
    controlAttribute: "inert",
    explicitBooleanValue: false,
    followControlledElements
  });
};
var supportsInert = () => typeof HTMLElement !== "undefined" && HTMLElement.prototype.hasOwnProperty("inert");
var suppressOthers = (originalTarget, parentNode, markerName = "data-suppressed", followControlledElements = true) => {
  const fn = supportsInert() ? inertOthers : hideOthers;
  return fn(originalTarget, parentNode, markerName, followControlledElements);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  hideOthers,
  inertOthers,
  suppressOthers
});
