import "../chunk-QZ7TP4HQ.mjs";

// src/utils/scroll-progress.ts
function getScrollProgress(element, scrollThreshold) {
  if (!element) return EMPTY_SCROLL_PROGRESS;
  let progressX = 0;
  let progressY = 0;
  const maxScrollX = element.scrollWidth - element.clientWidth;
  if (maxScrollX > scrollThreshold) {
    progressX = Math.min(1, Math.max(0, element.scrollLeft / maxScrollX));
  }
  const maxScrollY = element.scrollHeight - element.clientHeight;
  if (maxScrollY > scrollThreshold) {
    progressY = Math.min(1, Math.max(0, element.scrollTop / maxScrollY));
  }
  return { x: progressX, y: progressY };
}
var EMPTY_SCROLL_PROGRESS = { x: 0, y: 0 };
export {
  getScrollProgress
};
