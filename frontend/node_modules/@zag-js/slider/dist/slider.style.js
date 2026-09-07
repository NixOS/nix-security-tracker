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

// src/slider.style.ts
var slider_style_exports = {};
__export(slider_style_exports, {
  getControlStyle: () => getControlStyle,
  getMarkerGroupStyle: () => getMarkerGroupStyle,
  getMarkerStyle: () => getMarkerStyle,
  getRangeOffsets: () => getRangeOffsets,
  getRangeStyle: () => getRangeStyle,
  getRootStyle: () => getRootStyle,
  getThumbOffset: () => getThumbOffset,
  getThumbStyle: () => getThumbStyle,
  getVisibility: () => getVisibility
});
module.exports = __toCommonJS(slider_style_exports);
var import_utils = require("@zag-js/utils");
function getBounds(value) {
  const firstValue = value[0];
  const lastThumb = value[value.length - 1];
  return [firstValue, lastThumb];
}
function getRangeOffsets(params) {
  const { prop, computed } = params;
  const valuePercent = computed("valuePercent");
  const [firstPercent, lastPercent] = getBounds(valuePercent);
  if (valuePercent.length === 1) {
    if (prop("origin") === "center") {
      const isNegative = valuePercent[0] < 50;
      const start = isNegative ? `${valuePercent[0]}%` : "50%";
      const end = isNegative ? "50%" : `${100 - valuePercent[0]}%`;
      return { start, end };
    }
    if (prop("origin") === "end") {
      return { start: `${lastPercent}%`, end: "0%" };
    }
    return { start: "0%", end: `${100 - lastPercent}%` };
  }
  return { start: `${firstPercent}%`, end: `${100 - lastPercent}%` };
}
function getRangeStyle(params) {
  const { computed } = params;
  const isVertical = computed("isVertical");
  const isRtl = computed("isRtl");
  if (isVertical) {
    return {
      position: "absolute",
      bottom: "var(--slider-range-start)",
      top: "var(--slider-range-end)"
    };
  }
  return {
    position: "absolute",
    [isRtl ? "right" : "left"]: "var(--slider-range-start)",
    [isRtl ? "left" : "right"]: "var(--slider-range-end)"
  };
}
function getVerticalThumbOffset(params, value) {
  const { context, prop } = params;
  const { height = 0 } = context.get("thumbSize") ?? {};
  const getValue = (0, import_utils.getValueTransformer)([prop("min"), prop("max")], [-height / 2, height / 2]);
  return parseFloat(getValue(value).toFixed(2));
}
function getHorizontalThumbOffset(params, value) {
  const { computed, context, prop } = params;
  const { width = 0 } = context.get("thumbSize") ?? {};
  const isRtl = computed("isRtl");
  if (isRtl) {
    const getValue2 = (0, import_utils.getValueTransformer)([prop("max"), prop("min")], [-width / 2, width / 2]);
    return -1 * parseFloat(getValue2(value).toFixed(2));
  }
  const getValue = (0, import_utils.getValueTransformer)([prop("min"), prop("max")], [-width / 2, width / 2]);
  return parseFloat(getValue(value).toFixed(2));
}
function getOffset(params, percent, value) {
  const { computed, prop } = params;
  if (prop("thumbAlignment") === "center") return `${percent}%`;
  const offset = computed("isVertical") ? getVerticalThumbOffset(params, value) : getHorizontalThumbOffset(params, value);
  return `calc(${percent}% - ${offset}px)`;
}
function getThumbOffset(params, value) {
  const { prop } = params;
  const percent = (0, import_utils.getValuePercent)(value, prop("min"), prop("max")) * 100;
  return getOffset(params, percent, value);
}
function getVisibility(params) {
  const { computed, prop } = params;
  let visibility = "visible";
  if (prop("thumbAlignment") === "contain" && !computed("hasMeasuredThumbSize")) {
    visibility = "hidden";
  }
  return visibility;
}
function getThumbStyle(params, index) {
  const { computed, context } = params;
  const placementProp = computed("isVertical") ? "bottom" : "insetInlineStart";
  const focusedIndex = context.get("focusedIndex");
  return {
    visibility: getVisibility(params),
    position: "absolute",
    transform: "var(--slider-thumb-transform)",
    [placementProp]: `var(--slider-thumb-offset-${index})`,
    zIndex: focusedIndex === index ? 1 : void 0
  };
}
function getControlStyle() {
  return {
    touchAction: "none",
    userSelect: "none",
    WebkitUserSelect: "none",
    position: "relative"
  };
}
function getRootStyle(params) {
  const { context, computed } = params;
  const isVertical = computed("isVertical");
  const isRtl = computed("isRtl");
  const range = getRangeOffsets(params);
  const thumbSize = context.get("thumbSize");
  const offsetStyles = context.get("value").reduce((styles, value, index) => {
    const offset = getThumbOffset(params, value);
    return { ...styles, [`--slider-thumb-offset-${index}`]: offset };
  }, {});
  return {
    ...offsetStyles,
    "--slider-thumb-width": (0, import_utils.toPx)(thumbSize?.width),
    "--slider-thumb-height": (0, import_utils.toPx)(thumbSize?.height),
    "--slider-thumb-transform": isVertical ? "translateY(50%)" : isRtl ? "translateX(50%)" : "translateX(-50%)",
    "--slider-range-start": range.start,
    "--slider-range-end": range.end
  };
}
function getMarkerStyle(params, value) {
  const { computed } = params;
  const isHorizontal = computed("isHorizontal");
  const isRtl = computed("isRtl");
  return {
    visibility: getVisibility(params),
    position: "absolute",
    pointerEvents: "none",
    [isHorizontal ? "insetInlineStart" : "bottom"]: getThumbOffset(params, value),
    translate: "var(--translate-x) var(--translate-y)",
    "--translate-x": isHorizontal ? isRtl ? "50%" : "-50%" : "0%",
    "--translate-y": !isHorizontal ? "50%" : "0%"
  };
}
function getMarkerGroupStyle() {
  return {
    userSelect: "none",
    WebkitUserSelect: "none",
    pointerEvents: "none",
    position: "relative"
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getControlStyle,
  getMarkerGroupStyle,
  getMarkerStyle,
  getRangeOffsets,
  getRangeStyle,
  getRootStyle,
  getThumbOffset,
  getThumbStyle,
  getVisibility
});
