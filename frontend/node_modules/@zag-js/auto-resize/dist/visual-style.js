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

// src/visual-style.ts
var visual_style_exports = {};
__export(visual_style_exports, {
  getLayoutStyles: () => getLayoutStyles,
  getVisualStyles: () => getVisualStyles
});
module.exports = __toCommonJS(visual_style_exports);
var import_dom_query = require("@zag-js/dom-query");
function getVisualStyles(node) {
  if (!node) return;
  const style = (0, import_dom_query.getComputedStyle)(node);
  return "box-sizing:" + style.boxSizing + ";border-left:" + style.borderLeftWidth + " solid red;border-right:" + style.borderRightWidth + " solid red;font-family:" + style.fontFamily + ";font-feature-settings:" + style.fontFeatureSettings + ";font-kerning:" + style.fontKerning + ";font-size:" + style.fontSize + ";font-stretch:" + style.fontStretch + ";font-style:" + style.fontStyle + ";font-variant:" + style.fontVariant + ";font-variant-caps:" + style.fontVariantCaps + ";font-variant-ligatures:" + style.fontVariantLigatures + ";font-variant-numeric:" + style.fontVariantNumeric + ";font-weight:" + style.fontWeight + ";letter-spacing:" + style.letterSpacing + ";margin-left:" + style.marginLeft + ";margin-right:" + style.marginRight + ";padding-left:" + style.paddingLeft + ";padding-right:" + style.paddingRight + ";text-indent:" + style.textIndent + ";text-transform:" + style.textTransform;
}
function getLayoutStyles(node) {
  if (!node) return;
  const style = (0, import_dom_query.getComputedStyle)(node);
  return "width:" + style.width + ";max-width:" + style.maxWidth + ";min-width:" + style.minWidth + ";height:" + style.height + ";max-height:" + style.maxHeight + ";min-height:" + style.minHeight + ";box-sizing:" + style.boxSizing;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getLayoutStyles,
  getVisualStyles
});
