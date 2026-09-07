import "../chunk-QZ7TP4HQ.mjs";

// src/utils/scroll-offset.ts
import { getComputedStyle } from "@zag-js/dom-query";
function getScrollOffset(element, prop, axis) {
  if (!element) return 0;
  const styles = getComputedStyle(element);
  const propAxis = axis === "x" ? "Inline" : "Block";
  if (axis === "x" && prop === "margin") {
    return parseFloat(styles[`${prop}InlineStart`]) * 2;
  }
  return parseFloat(styles[`${prop}${propAxis}Start`]) + parseFloat(styles[`${prop}${propAxis}End`]);
}
export {
  getScrollOffset
};
