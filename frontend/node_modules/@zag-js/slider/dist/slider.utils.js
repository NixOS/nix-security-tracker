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

// src/slider.utils.ts
var slider_utils_exports = {};
__export(slider_utils_exports, {
  assignArray: () => assignArray,
  constrainValue: () => constrainValue,
  decrement: () => decrement,
  getClosestIndex: () => getClosestIndex,
  getRangeAtIndex: () => getRangeAtIndex,
  increment: () => increment,
  normalizeValues: () => normalizeValues,
  resolveThumbCollision: () => resolveThumbCollision,
  selectMovableThumb: () => selectMovableThumb
});
module.exports = __toCommonJS(slider_utils_exports);
var import_utils = require("@zag-js/utils");
function getThumbBounds(ctx) {
  const { index, values, min, max, gap } = ctx;
  const prevThumb = values[index - 1];
  const nextThumb = values[index + 1];
  return {
    min: prevThumb != null ? prevThumb + gap : min,
    max: nextThumb != null ? nextThumb - gap : max
  };
}
function round(value) {
  return Math.round(value * 1e10) / 1e10;
}
function handleNone(ctx) {
  const { index, value, values } = ctx;
  const bounds = getThumbBounds(ctx);
  const nextValues = values.slice();
  nextValues[index] = round((0, import_utils.clampValue)(value, bounds.min, bounds.max));
  return { values: nextValues, index, swapped: false };
}
function handlePush(ctx) {
  const { index, value, values, min, max, gap } = ctx;
  const nextValues = values.slice();
  const absoluteMin = min + index * gap;
  const absoluteMax = max - (values.length - 1 - index) * gap;
  nextValues[index] = round((0, import_utils.clampValue)(value, absoluteMin, absoluteMax));
  for (let i = index + 1; i < values.length; i++) {
    const minAllowed = nextValues[i - 1] + gap;
    if (nextValues[i] < minAllowed) {
      nextValues[i] = round(minAllowed);
    }
  }
  for (let i = index - 1; i >= 0; i--) {
    const maxAllowed = nextValues[i + 1] - gap;
    if (nextValues[i] > maxAllowed) {
      nextValues[i] = round(maxAllowed);
    }
  }
  return { values: nextValues, index, swapped: false };
}
function handleSwap(ctx, startValue) {
  const { index, value, values, gap } = ctx;
  const prevThumb = values[index - 1];
  const nextThumb = values[index + 1];
  const crossingNext = nextThumb != null && value >= nextThumb && value > startValue;
  const crossingPrev = prevThumb != null && value <= prevThumb && value < startValue;
  if (!crossingNext && !crossingPrev) {
    return handleNone(ctx);
  }
  const swapIndex = crossingNext ? index + 1 : index - 1;
  const nextValues = values.slice();
  const newCtx = { ...ctx, index: swapIndex };
  const bounds = getThumbBounds(newCtx);
  nextValues[swapIndex] = round((0, import_utils.clampValue)(value, bounds.min, bounds.max));
  nextValues[index] = values[swapIndex];
  if (crossingNext && nextValues[index] > nextValues[swapIndex] - gap) {
    nextValues[index] = round(nextValues[swapIndex] - gap);
  } else if (crossingPrev && nextValues[index] < nextValues[swapIndex] + gap) {
    nextValues[index] = round(nextValues[swapIndex] + gap);
  }
  return { values: nextValues, index: swapIndex, swapped: true };
}
function resolveThumbCollision(behavior, index, value, values, min, max, step, minStepsBetweenThumbs, startValue) {
  if (values.length === 1) {
    return { values: [round((0, import_utils.clampValue)(value, min, max))], index: 0, swapped: false };
  }
  const gap = step * minStepsBetweenThumbs;
  const ctx = { behavior, index, value, values, min, max, gap };
  switch (behavior) {
    case "push":
      return handlePush(ctx);
    case "swap":
      return handleSwap(ctx, startValue ?? values[index]);
    case "none":
    default:
      return handleNone(ctx);
  }
}
function normalizeValues(params, nextValues) {
  return nextValues.map((value, index) => {
    return constrainValue(params, value, index);
  });
}
function getRangeAtIndex(params, index) {
  const { context, prop } = params;
  const step = prop("step") * prop("minStepsBetweenThumbs");
  return (0, import_utils.getValueRanges)(context.get("value"), prop("min"), prop("max"), step)[index];
}
function constrainValue(params, value, index) {
  const { prop } = params;
  const range = getRangeAtIndex(params, index);
  const snapValue = (0, import_utils.snapValueToStep)(value, prop("min"), prop("max"), prop("step"));
  return (0, import_utils.clampValue)(snapValue, range.min, range.max);
}
function decrement(params, index, step) {
  const { context, prop } = params;
  const idx = index ?? context.get("focusedIndex");
  const range = getRangeAtIndex(params, idx);
  const nextValues = (0, import_utils.getPreviousStepValue)(idx, {
    ...range,
    step: step ?? prop("step"),
    values: context.get("value")
  });
  nextValues[idx] = (0, import_utils.clampValue)(nextValues[idx], range.min, range.max);
  return nextValues;
}
function increment(params, index, step) {
  const { context, prop } = params;
  const idx = index ?? context.get("focusedIndex");
  const range = getRangeAtIndex(params, idx);
  const nextValues = (0, import_utils.getNextStepValue)(idx, {
    ...range,
    step: step ?? prop("step"),
    values: context.get("value")
  });
  nextValues[idx] = (0, import_utils.clampValue)(nextValues[idx], range.min, range.max);
  return nextValues;
}
function getClosestIndex(params, pointValue) {
  const { context } = params;
  const values = context.get("value");
  let closestIndex = 0;
  let minDistance = Math.abs(values[0] - pointValue);
  for (let i = 1; i < values.length; i++) {
    const distance = Math.abs(values[i] - pointValue);
    if (distance <= minDistance) {
      closestIndex = i;
      minDistance = distance;
    }
  }
  return selectMovableThumb(params, closestIndex);
}
function selectMovableThumb(params, index) {
  const { context, prop } = params;
  const values = context.get("value");
  const max = prop("max");
  const thumbValue = values[index];
  if (thumbValue === max) {
    let movableIndex = index;
    while (movableIndex > 0 && values[movableIndex - 1] === max) {
      movableIndex -= 1;
    }
    return movableIndex;
  }
  return index;
}
function assignArray(current, next) {
  for (let i = 0; i < next.length; i++) {
    const value = next[i];
    current[i] = value;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  assignArray,
  constrainValue,
  decrement,
  getClosestIndex,
  getRangeAtIndex,
  increment,
  normalizeValues,
  resolveThumbCollision,
  selectMovableThumb
});
