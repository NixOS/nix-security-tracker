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

// src/floating-panel.dom.ts
var floating_panel_dom_exports = {};
__export(floating_panel_dom_exports, {
  getBoundaryRect: () => getBoundaryRect,
  getContentEl: () => getContentEl,
  getContentId: () => getContentId,
  getHeaderEl: () => getHeaderEl,
  getHeaderId: () => getHeaderId,
  getPositionerEl: () => getPositionerEl,
  getPositionerId: () => getPositionerId,
  getTitleId: () => getTitleId,
  getTriggerEl: () => getTriggerEl,
  getTriggerId: () => getTriggerId
});
module.exports = __toCommonJS(floating_panel_dom_exports);
var import_dom_query = require("@zag-js/dom-query");
var import_rect_utils = require("@zag-js/rect-utils");
var import_utils = require("@zag-js/utils");
var getTriggerId = (ctx) => ctx.ids?.trigger ?? `float:${ctx.id}:trigger`;
var getPositionerId = (ctx) => ctx.ids?.positioner ?? `float:${ctx.id}:positioner`;
var getContentId = (ctx) => ctx.ids?.content ?? `float:${ctx.id}:content`;
var getTitleId = (ctx) => ctx.ids?.title ?? `float:${ctx.id}:title`;
var getHeaderId = (ctx) => ctx.ids?.header ?? `float:${ctx.id}:header`;
var getTriggerEl = (ctx) => ctx.getById(getTriggerId(ctx));
var getPositionerEl = (ctx) => ctx.getById(getPositionerId(ctx));
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getHeaderEl = (ctx) => ctx.getById(getHeaderId(ctx));
var getBoundaryRect = (ctx, boundaryEl, allowOverflow) => {
  let boundaryRect;
  if ((0, import_dom_query.isHTMLElement)(boundaryEl)) {
    boundaryRect = (0, import_rect_utils.getElementRect)(boundaryEl);
  } else {
    boundaryRect = (0, import_rect_utils.getWindowRect)(ctx.getWin());
  }
  if (allowOverflow) {
    boundaryRect = (0, import_rect_utils.createRect)({
      x: -boundaryRect.width,
      // empty(left)
      y: boundaryRect.minY,
      width: boundaryRect.width * 3,
      // empty(left) + win + empty(right)
      height: boundaryRect.height * 2
      // win + empty(bottom)
    });
  }
  return (0, import_utils.pick)(boundaryRect, ["x", "y", "width", "height"]);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getBoundaryRect,
  getContentEl,
  getContentId,
  getHeaderEl,
  getHeaderId,
  getPositionerEl,
  getPositionerId,
  getTitleId,
  getTriggerEl,
  getTriggerId
});
