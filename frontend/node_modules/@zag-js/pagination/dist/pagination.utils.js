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

// src/pagination.utils.ts
var pagination_utils_exports = {};
__export(pagination_utils_exports, {
  getRange: () => getRange,
  getTransformedRange: () => getTransformedRange,
  range: () => range,
  transform: () => transform
});
module.exports = __toCommonJS(pagination_utils_exports);
var import_utils = require("@zag-js/utils");
var range = (start, end) => {
  let length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};
var transform = (items) => {
  return items.map((value) => {
    if ((0, import_utils.isNumber)(value)) return { type: "page", value };
    return { type: "ellipsis" };
  });
};
var ELLIPSIS = "ellipsis";
var getRange = (ctx) => {
  const { page, totalPages, siblingCount, boundaryCount = 1 } = ctx;
  if (totalPages <= 0) return [];
  if (totalPages === 1) return [1];
  const firstPageIndex = 1;
  const lastPageIndex = totalPages;
  const leftSiblingIndex = Math.max(page - siblingCount, firstPageIndex);
  const rightSiblingIndex = Math.min(page + siblingCount, lastPageIndex);
  const totalPageNumbers = Math.min(siblingCount * 2 + 3 + boundaryCount * 2, totalPages);
  if (totalPages <= totalPageNumbers) {
    return range(firstPageIndex, lastPageIndex);
  }
  const itemCount = totalPageNumbers - 1 - boundaryCount;
  const showLeftEllipsis = leftSiblingIndex > firstPageIndex + boundaryCount + 1 && Math.abs(leftSiblingIndex - firstPageIndex) > boundaryCount + 1;
  const showRightEllipsis = rightSiblingIndex < lastPageIndex - boundaryCount - 1 && Math.abs(lastPageIndex - rightSiblingIndex) > boundaryCount + 1;
  let pages = [];
  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = range(1, itemCount);
    pages.push(...leftRange, ELLIPSIS);
    pages.push(...range(lastPageIndex - boundaryCount + 1, lastPageIndex));
  } else if (showLeftEllipsis && !showRightEllipsis) {
    pages.push(...range(firstPageIndex, firstPageIndex + boundaryCount - 1));
    pages.push(ELLIPSIS);
    const rightRange = range(lastPageIndex - itemCount + 1, lastPageIndex);
    pages.push(...rightRange);
  } else if (showLeftEllipsis && showRightEllipsis) {
    pages.push(...range(firstPageIndex, firstPageIndex + boundaryCount - 1));
    pages.push(ELLIPSIS);
    const middleRange = range(leftSiblingIndex, rightSiblingIndex);
    pages.push(...middleRange);
    pages.push(ELLIPSIS);
    pages.push(...range(lastPageIndex - boundaryCount + 1, lastPageIndex));
  } else {
    pages.push(...range(firstPageIndex, lastPageIndex));
  }
  for (let i = 0; i < pages.length; i++) {
    if (pages[i] === ELLIPSIS) {
      const prevPage = (0, import_utils.isNumber)(pages[i - 1]) ? pages[i - 1] : 0;
      const nextPage = (0, import_utils.isNumber)(pages[i + 1]) ? pages[i + 1] : totalPages + 1;
      if (nextPage - prevPage === 2) {
        pages[i] = prevPage + 1;
      }
    }
  }
  return pages;
};
var getTransformedRange = (ctx) => transform(getRange(ctx));
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getRange,
  getTransformedRange,
  range,
  transform
});
