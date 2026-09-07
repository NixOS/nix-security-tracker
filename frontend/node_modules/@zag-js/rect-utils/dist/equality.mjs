import "./chunk-QZ7TP4HQ.mjs";

// src/equality.ts
var isSizeEqual = (a, b) => {
  return a.width === b?.width && a.height === b?.height;
};
var isPointEqual = (a, b) => {
  return a.x === b?.x && a.y === b?.y;
};
var isRectEqual = (a, b) => {
  return isPointEqual(a, b) && isSizeEqual(a, b);
};
export {
  isPointEqual,
  isRectEqual,
  isSizeEqual
};
