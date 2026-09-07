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

// src/slider.dom.ts
var slider_dom_exports = {};
__export(slider_dom_exports, {
  dispatchChangeEvent: () => dispatchChangeEvent,
  getControlEl: () => getControlEl,
  getControlId: () => getControlId,
  getFirstThumbEl: () => getFirstThumbEl,
  getHiddenInputEl: () => getHiddenInputEl,
  getHiddenInputId: () => getHiddenInputId,
  getLabelId: () => getLabelId,
  getMarkerId: () => getMarkerId,
  getOffsetRect: () => getOffsetRect,
  getPointValue: () => getPointValue,
  getRangeEl: () => getRangeEl,
  getRangeId: () => getRangeId,
  getRootEl: () => getRootEl,
  getRootId: () => getRootId,
  getThumbEl: () => getThumbEl,
  getThumbEls: () => getThumbEls,
  getThumbId: () => getThumbId,
  getTrackId: () => getTrackId,
  getValueTextId: () => getValueTextId
});
module.exports = __toCommonJS(slider_dom_exports);
var import_dom_query = require("@zag-js/dom-query");
var import_utils = require("@zag-js/utils");
var getRootId = (ctx) => ctx.ids?.root ?? `slider:${ctx.id}`;
var getThumbId = (ctx, index) => ctx.ids?.thumb?.(index) ?? `slider:${ctx.id}:thumb:${index}`;
var getHiddenInputId = (ctx, index) => ctx.ids?.hiddenInput?.(index) ?? `slider:${ctx.id}:input:${index}`;
var getControlId = (ctx) => ctx.ids?.control ?? `slider:${ctx.id}:control`;
var getTrackId = (ctx) => ctx.ids?.track ?? `slider:${ctx.id}:track`;
var getRangeId = (ctx) => ctx.ids?.range ?? `slider:${ctx.id}:range`;
var getLabelId = (ctx) => ctx.ids?.label ?? `slider:${ctx.id}:label`;
var getValueTextId = (ctx) => ctx.ids?.valueText ?? `slider:${ctx.id}:value-text`;
var getMarkerId = (ctx, value) => ctx.ids?.marker?.(value) ?? `slider:${ctx.id}:marker:${value}`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getThumbEl = (ctx, index) => ctx.getById(getThumbId(ctx, index));
var getThumbEls = (ctx) => (0, import_dom_query.queryAll)(getControlEl(ctx), "[role=slider]");
var getFirstThumbEl = (ctx) => getThumbEls(ctx)[0];
var getHiddenInputEl = (ctx, index) => ctx.getById(getHiddenInputId(ctx, index));
var getControlEl = (ctx) => ctx.getById(getControlId(ctx));
var getRangeEl = (ctx) => ctx.getById(getRangeId(ctx));
var getThumbInset = (thumbSize, thumbAlignment, orientation) => {
  const isContain = thumbAlignment === "contain";
  const isVertical = orientation === "vertical";
  return isContain ? (isVertical ? thumbSize?.height ?? 0 : thumbSize?.width ?? 0) / 2 : 0;
};
var getPointValue = (params, point) => {
  const { context, prop, scope, refs } = params;
  const controlEl = getControlEl(scope);
  if (!controlEl) return;
  const offset = refs.get("thumbDragOffset");
  const adjustedPoint = {
    x: point.x - (offset?.x ?? 0),
    y: point.y - (offset?.y ?? 0)
  };
  const thumbInset = getThumbInset(context.get("thumbSize"), prop("thumbAlignment"), prop("orientation"));
  const relativePoint = getRelativePointWithInset(adjustedPoint, controlEl, thumbInset);
  const percent = relativePoint.getPercentValue({
    orientation: prop("orientation"),
    dir: prop("dir"),
    inverted: { y: true }
  });
  return (0, import_utils.getPercentValue)(percent, prop("min"), prop("max"), prop("step"));
};
function getRelativePointWithInset(point, element, inset) {
  const { left, top, width, height } = element.getBoundingClientRect();
  const effectiveWidth = width - inset * 2;
  const effectiveHeight = height - inset * 2;
  const effectiveLeft = left + inset;
  const effectiveTop = top + inset;
  const offset = {
    x: point.x - effectiveLeft,
    y: point.y - effectiveTop
  };
  const percent = {
    x: effectiveWidth > 0 ? (0, import_utils.clampPercent)(offset.x / effectiveWidth) : 0,
    y: effectiveHeight > 0 ? (0, import_utils.clampPercent)(offset.y / effectiveHeight) : 0
  };
  function getPercentValue2(options = {}) {
    const { dir = "ltr", orientation = "horizontal", inverted } = options;
    const invertX = typeof inverted === "object" ? inverted.x : inverted;
    const invertY = typeof inverted === "object" ? inverted.y : inverted;
    if (orientation === "horizontal") {
      return dir === "rtl" || invertX ? 1 - percent.x : percent.x;
    }
    return invertY ? 1 - percent.y : percent.y;
  }
  return { offset, percent, getPercentValue: getPercentValue2 };
}
var dispatchChangeEvent = (ctx, value) => {
  value.forEach((value2, index) => {
    const inputEl = getHiddenInputEl(ctx, index);
    if (!inputEl) return;
    (0, import_dom_query.dispatchInputValueEvent)(inputEl, { value: value2 });
  });
};
var getOffsetRect = (el) => ({
  left: el?.offsetLeft ?? 0,
  top: el?.offsetTop ?? 0,
  width: el?.offsetWidth ?? 0,
  height: el?.offsetHeight ?? 0
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  dispatchChangeEvent,
  getControlEl,
  getControlId,
  getFirstThumbEl,
  getHiddenInputEl,
  getHiddenInputId,
  getLabelId,
  getMarkerId,
  getOffsetRect,
  getPointValue,
  getRangeEl,
  getRangeId,
  getRootEl,
  getRootId,
  getThumbEl,
  getThumbEls,
  getThumbId,
  getTrackId,
  getValueTextId
});
