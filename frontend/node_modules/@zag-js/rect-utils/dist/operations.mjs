import "./chunk-QZ7TP4HQ.mjs";

// src/operations.ts
import { createRect } from "./rect.mjs";
var isSymmetric = (v) => "dx" in v || "dy" in v;
function inset(r, i) {
  const v = isSymmetric(i) ? { left: i.dx, right: i.dx, top: i.dy, bottom: i.dy } : i;
  const { top = 0, right = 0, bottom = 0, left = 0 } = v;
  return createRect({
    x: r.x + left,
    y: r.y + top,
    width: r.width - left - right,
    height: r.height - top - bottom
  });
}
function expand(r, v) {
  const value = typeof v === "number" ? { dx: -v, dy: -v } : v;
  return inset(r, value);
}
function shrink(r, v) {
  const value = typeof v === "number" ? { dx: -v, dy: -v } : v;
  return inset(r, value);
}
function shift(r, o) {
  const { x = 0, y = 0 } = o;
  return createRect({
    x: r.x + x,
    y: r.y + y,
    width: r.width,
    height: r.height
  });
}
export {
  expand,
  inset,
  isSymmetric,
  shift,
  shrink
};
