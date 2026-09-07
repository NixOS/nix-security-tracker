// src/slider.style.ts
import { getValuePercent, getValueTransformer, toPx } from "@zag-js/utils";
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
  const getValue = getValueTransformer([prop("min"), prop("max")], [-height / 2, height / 2]);
  return parseFloat(getValue(value).toFixed(2));
}
function getHorizontalThumbOffset(params, value) {
  const { computed, context, prop } = params;
  const { width = 0 } = context.get("thumbSize") ?? {};
  const isRtl = computed("isRtl");
  if (isRtl) {
    const getValue2 = getValueTransformer([prop("max"), prop("min")], [-width / 2, width / 2]);
    return -1 * parseFloat(getValue2(value).toFixed(2));
  }
  const getValue = getValueTransformer([prop("min"), prop("max")], [-width / 2, width / 2]);
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
  const percent = getValuePercent(value, prop("min"), prop("max")) * 100;
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
    "--slider-thumb-width": toPx(thumbSize?.width),
    "--slider-thumb-height": toPx(thumbSize?.height),
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
export {
  getControlStyle,
  getMarkerGroupStyle,
  getMarkerStyle,
  getRangeOffsets,
  getRangeStyle,
  getRootStyle,
  getThumbOffset,
  getThumbStyle,
  getVisibility
};
