import "./chunk-QZ7TP4HQ.mjs";

// src/from-range.ts
import { createRect } from "./rect.mjs";
import { getElementRect } from "./from-element.mjs";
import { union } from "./union.mjs";
function fromRange(range) {
  let rs = [];
  const rects = Array.from(range.getClientRects());
  if (rects.length) {
    rs = rs.concat(rects.map(createRect));
    return union.apply(void 0, rs);
  }
  let start = range.startContainer;
  if (start.nodeType === Node.TEXT_NODE) {
    start = start.parentNode;
  }
  if (start instanceof HTMLElement) {
    const r = getElementRect(start);
    rs.push({ ...r, x: r.maxX, width: 0 });
  }
  return union.apply(void 0, rs);
}
export {
  fromRange
};
