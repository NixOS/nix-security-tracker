import "./chunk-QZ7TP4HQ.mjs";

// src/contains.ts
import { getRectCorners, isRect } from "./rect.mjs";
function containsPoint(r, p) {
  return r.minX <= p.x && p.x <= r.maxX && r.minY <= p.y && p.y <= r.maxY;
}
function containsRect(a, b) {
  return Object.values(getRectCorners(b)).every((c) => containsPoint(a, c));
}
function contains(r, v) {
  return isRect(v) ? containsRect(r, v) : containsPoint(r, v);
}
export {
  contains,
  containsPoint,
  containsRect
};
