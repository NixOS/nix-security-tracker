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

// src/utils/resize-by-delta.ts
var resize_by_delta_exports = {};
__export(resize_by_delta_exports, {
  resizeByDelta: () => resizeByDelta
});
module.exports = __toCommonJS(resize_by_delta_exports);
var import_utils = require("@zag-js/utils");
var import_fuzzy = require("./fuzzy.js");
var import_resize_panel = require("./resize-panel.js");
function resizeByDelta(props) {
  let { delta, initialSize, panels, pivotIndices, prevSize, trigger } = props;
  if ((0, import_fuzzy.fuzzyNumbersEqual)(delta, 0)) {
    return initialSize;
  }
  const nextSize = [...initialSize];
  const [firstPivotIndex, secondPivotIndex] = pivotIndices;
  (0, import_utils.ensure)(firstPivotIndex, () => "Invalid first pivot index");
  (0, import_utils.ensure)(secondPivotIndex, () => "Invalid second pivot index");
  let deltaApplied = 0;
  {
    if (trigger === "keyboard") {
      {
        const index = delta < 0 ? secondPivotIndex : firstPivotIndex;
        const panel = panels[index];
        (0, import_utils.ensure)(panel, () => `Panel data not found for index ${index}`);
        const { collapsedSize = 0, collapsible, minSize = 0 } = panel;
        if (collapsible) {
          const prevSize2 = initialSize[index];
          (0, import_utils.ensure)(prevSize2, () => `Previous size not found for panel index ${index}`);
          if ((0, import_fuzzy.fuzzyNumbersEqual)(prevSize2, collapsedSize)) {
            const localDelta = minSize - prevSize2;
            if ((0, import_fuzzy.fuzzyCompareNumbers)(localDelta, Math.abs(delta)) > 0) {
              delta = delta < 0 ? 0 - localDelta : localDelta;
            }
          }
        }
      }
      {
        const index = delta < 0 ? firstPivotIndex : secondPivotIndex;
        const panel = panels[index];
        (0, import_utils.ensure)(panel, () => `No panel data found for index ${index}`);
        const { collapsedSize = 0, collapsible, minSize = 0 } = panel;
        if (collapsible) {
          const prevSize2 = initialSize[index];
          (0, import_utils.ensure)(prevSize2, () => `Previous size not found for panel index ${index}`);
          if ((0, import_fuzzy.fuzzyNumbersEqual)(prevSize2, minSize)) {
            const localDelta = prevSize2 - collapsedSize;
            if ((0, import_fuzzy.fuzzyCompareNumbers)(localDelta, Math.abs(delta)) > 0) {
              delta = delta < 0 ? 0 - localDelta : localDelta;
            }
          }
        }
      }
    }
  }
  {
    const increment = delta < 0 ? 1 : -1;
    let index = delta < 0 ? secondPivotIndex : firstPivotIndex;
    let maxAvailableDelta = 0;
    while (true) {
      const prevSize2 = initialSize[index];
      (0, import_utils.ensure)(prevSize2, () => `Previous size not found for panel index ${index}`);
      const maxSafeSize = (0, import_resize_panel.resizePanel)({
        panels,
        index,
        size: 100
      });
      const delta2 = maxSafeSize - prevSize2;
      maxAvailableDelta += delta2;
      index += increment;
      if (index < 0 || index >= panels.length) {
        break;
      }
    }
    const minAbsDelta = Math.min(Math.abs(delta), Math.abs(maxAvailableDelta));
    delta = delta < 0 ? 0 - minAbsDelta : minAbsDelta;
  }
  {
    const pivotIndex = delta < 0 ? firstPivotIndex : secondPivotIndex;
    let index = pivotIndex;
    while (index >= 0 && index < panels.length) {
      const deltaRemaining = Math.abs(delta) - Math.abs(deltaApplied);
      const prevSize2 = initialSize[index];
      (0, import_utils.ensure)(prevSize2, () => `Previous size not found for panel index ${index}`);
      const unsafeSize = prevSize2 - deltaRemaining;
      const safeSize = (0, import_resize_panel.resizePanel)({ panels, index, size: unsafeSize });
      if (!(0, import_fuzzy.fuzzyNumbersEqual)(prevSize2, safeSize)) {
        deltaApplied += prevSize2 - safeSize;
        nextSize[index] = safeSize;
        if (deltaApplied.toPrecision(3).localeCompare(Math.abs(delta).toPrecision(3), void 0, {
          numeric: true
        }) >= 0) {
          break;
        }
      }
      if (delta < 0) {
        index--;
      } else {
        index++;
      }
    }
  }
  if ((0, import_fuzzy.fuzzySizeEqual)(prevSize, nextSize)) {
    return prevSize;
  }
  {
    const pivotIndex = delta < 0 ? secondPivotIndex : firstPivotIndex;
    const prevSize2 = initialSize[pivotIndex];
    (0, import_utils.ensure)(prevSize2, () => `Previous size not found for panel index ${pivotIndex}`);
    const unsafeSize = prevSize2 + deltaApplied;
    const safeSize = (0, import_resize_panel.resizePanel)({ panels, index: pivotIndex, size: unsafeSize });
    nextSize[pivotIndex] = safeSize;
    if (!(0, import_fuzzy.fuzzyNumbersEqual)(safeSize, unsafeSize)) {
      let deltaRemaining = unsafeSize - safeSize;
      const pivotIndex2 = delta < 0 ? secondPivotIndex : firstPivotIndex;
      let index = pivotIndex2;
      while (index >= 0 && index < panels.length) {
        const prevSize3 = nextSize[index];
        (0, import_utils.ensure)(prevSize3, () => `Previous size not found for panel index ${index}`);
        const unsafeSize2 = prevSize3 + deltaRemaining;
        const safeSize2 = (0, import_resize_panel.resizePanel)({ panels, index, size: unsafeSize2 });
        if (!(0, import_fuzzy.fuzzyNumbersEqual)(prevSize3, safeSize2)) {
          deltaRemaining -= safeSize2 - prevSize3;
          nextSize[index] = safeSize2;
        }
        if ((0, import_fuzzy.fuzzyNumbersEqual)(deltaRemaining, 0)) {
          break;
        }
        if (delta > 0) {
          index--;
        } else {
          index++;
        }
      }
    }
  }
  const totalSize = nextSize.reduce((total, size) => size + total, 0);
  if (!(0, import_fuzzy.fuzzyNumbersEqual)(totalSize, 100)) {
    return prevSize;
  }
  return nextSize;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  resizeByDelta
});
