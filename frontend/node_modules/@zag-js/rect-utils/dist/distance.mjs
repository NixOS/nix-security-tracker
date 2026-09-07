import "./chunk-QZ7TP4HQ.mjs";

// src/distance.ts
import { intersects } from "./intersection.mjs";
function distance(a, b = { x: 0, y: 0 }) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
function distanceFromPoint(r, p) {
  let x = 0;
  let y = 0;
  if (p.x < r.x) x = r.x - p.x;
  else if (p.x > r.maxX) x = p.x - r.maxX;
  if (p.y < r.y) y = r.y - p.y;
  else if (p.y > r.maxY) y = p.y - r.maxY;
  return { x, y, value: distance({ x, y }) };
}
function distanceFromRect(a, b) {
  if (intersects(a, b)) return { x: 0, y: 0, value: 0 };
  const left = a.x < b.x ? a : b;
  const right = b.x < a.x ? a : b;
  const upper = a.y < b.y ? a : b;
  const lower = b.y < a.y ? a : b;
  let x = left.x === right.x ? 0 : right.x - left.maxX;
  x = Math.max(0, x);
  let y = upper.y === lower.y ? 0 : lower.y - upper.maxY;
  y = Math.max(0, y);
  return { x, y, value: distance({ x, y }) };
}
function distanceBtwEdges(a, b) {
  return {
    left: b.x - a.x,
    top: b.y - a.y,
    right: a.maxX - b.maxX,
    bottom: a.maxY - b.maxY
  };
}
export {
  distance,
  distanceBtwEdges,
  distanceFromPoint,
  distanceFromRect
};
