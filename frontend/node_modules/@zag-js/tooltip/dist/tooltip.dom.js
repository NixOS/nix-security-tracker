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

// src/tooltip.dom.ts
var tooltip_dom_exports = {};
__export(tooltip_dom_exports, {
  getActiveTriggerEl: () => getActiveTriggerEl,
  getArrowEl: () => getArrowEl,
  getArrowId: () => getArrowId,
  getContentEl: () => getContentEl,
  getContentId: () => getContentId,
  getPositionerEl: () => getPositionerEl,
  getPositionerId: () => getPositionerId,
  getTriggerEl: () => getTriggerEl,
  getTriggerEls: () => getTriggerEls,
  getTriggerId: () => getTriggerId
});
module.exports = __toCommonJS(tooltip_dom_exports);
var import_dom_query = require("@zag-js/dom-query");
var import_utils = require("@zag-js/utils");
var getTriggerId = (scope, value) => {
  const customId = scope.ids?.trigger;
  if (customId != null) return (0, import_utils.isFunction)(customId) ? customId(value) : customId;
  return value ? `tooltip:${scope.id}:trigger:${value}` : `tooltip:${scope.id}:trigger`;
};
var getContentId = (scope) => scope.ids?.content ?? `tooltip:${scope.id}:content`;
var getArrowId = (scope) => scope.ids?.arrow ?? `tooltip:${scope.id}:arrow`;
var getPositionerId = (scope) => scope.ids?.positioner ?? `tooltip:${scope.id}:popper`;
var getTriggerEl = (scope) => scope.getById(getTriggerId(scope));
var getContentEl = (scope) => scope.getById(getContentId(scope));
var getPositionerEl = (scope) => scope.getById(getPositionerId(scope));
var getArrowEl = (scope) => scope.getById(getArrowId(scope));
var getTriggerEls = (scope) => (0, import_dom_query.queryAll)(scope.getRootNode(), `[data-scope="tooltip"][data-part="trigger"]${(0, import_dom_query.getByOwnerId)(scope.id)}`);
var getActiveTriggerEl = (scope, value) => {
  if (value == null) {
    return getTriggerEl(scope) ?? getTriggerEls(scope)[0];
  }
  return scope.getById(getTriggerId(scope, value));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getActiveTriggerEl,
  getArrowEl,
  getArrowId,
  getContentEl,
  getContentId,
  getPositionerEl,
  getPositionerId,
  getTriggerEl,
  getTriggerEls,
  getTriggerId
});
