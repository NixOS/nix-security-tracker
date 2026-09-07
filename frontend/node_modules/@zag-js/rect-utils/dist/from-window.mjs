import "./chunk-QZ7TP4HQ.mjs";

// src/from-window.ts
import { createRect } from "./rect.mjs";
function getWindowRect(win, opts = {}) {
  return createRect(getViewportRect(win, opts));
}
function getViewportRect(win, opts) {
  const { excludeScrollbar = false } = opts;
  const { innerWidth, innerHeight, document: doc, visualViewport } = win;
  const width = visualViewport?.width || innerWidth;
  const height = visualViewport?.height || innerHeight;
  const rect = { x: 0, y: 0, width, height };
  if (excludeScrollbar) {
    const scrollbarWidth = innerWidth - doc.documentElement.clientWidth;
    const scrollbarHeight = innerHeight - doc.documentElement.clientHeight;
    rect.width -= scrollbarWidth;
    rect.height -= scrollbarHeight;
  }
  return rect;
}
export {
  getViewportRect,
  getWindowRect
};
