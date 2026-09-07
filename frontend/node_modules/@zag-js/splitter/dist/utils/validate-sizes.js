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

// src/utils/validate-sizes.ts
var validate_sizes_exports = {};
__export(validate_sizes_exports, {
  validateSizes: () => validateSizes
});
module.exports = __toCommonJS(validate_sizes_exports);
var import_utils = require("@zag-js/utils");
var import_fuzzy = require("./fuzzy.js");
var import_resize_panel = require("./resize-panel.js");
function validateSizes({ size: prevSize, panels }) {
  const nextSize = [...prevSize];
  const nextSizeTotalSize = nextSize.reduce((accumulated, current) => accumulated + current, 0);
  if (nextSize.length !== panels.length) {
    throw Error(`Invalid ${panels.length} panel size: ${nextSize.map((size) => `${size}%`).join(", ")}`);
  } else if (!(0, import_fuzzy.fuzzyNumbersEqual)(nextSizeTotalSize, 100) && nextSize.length > 0) {
    for (let index = 0; index < panels.length; index++) {
      const unsafeSize = nextSize[index];
      (0, import_utils.ensure)(unsafeSize, () => `No size data found for index ${index}`);
      const safeSize = 100 / nextSizeTotalSize * unsafeSize;
      nextSize[index] = safeSize;
    }
  }
  let remainingSize = 0;
  for (let index = 0; index < panels.length; index++) {
    const unsafeSize = nextSize[index];
    (0, import_utils.ensure)(unsafeSize, () => `No size data found for index ${index}`);
    const safeSize = (0, import_resize_panel.resizePanel)({ panels, index, size: unsafeSize });
    if (unsafeSize != safeSize) {
      remainingSize += unsafeSize - safeSize;
      nextSize[index] = safeSize;
    }
  }
  if (!(0, import_fuzzy.fuzzyNumbersEqual)(remainingSize, 0)) {
    for (let index = 0; index < panels.length; index++) {
      const prevSize2 = nextSize[index];
      (0, import_utils.ensure)(prevSize2, () => `No size data found for index ${index}`);
      const unsafeSize = prevSize2 + remainingSize;
      const safeSize = (0, import_resize_panel.resizePanel)({ panels, index, size: unsafeSize });
      if (prevSize2 !== safeSize) {
        remainingSize -= safeSize - prevSize2;
        nextSize[index] = safeSize;
        if ((0, import_fuzzy.fuzzyNumbersEqual)(remainingSize, 0)) {
          break;
        }
      }
    }
  }
  return nextSize;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  validateSizes
});
