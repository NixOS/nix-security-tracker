import "./chunk-QZ7TP4HQ.mjs";

// src/intersection.ts
import { createRect } from "./rect.mjs";
function intersects(a, b) {
  return a.x < b.maxX && a.y < b.maxY && a.maxX > b.x && a.maxY > b.y;
}
function intersection(a, b) {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);
  return createRect({ x, y, width: x2 - x, height: y2 - y });
}
function collisions(a, b) {
  return {
    top: a.minY <= b.minY,
    right: a.maxX >= b.maxX,
    bottom: a.maxY >= b.maxY,
    left: a.minX <= b.minX
  };
}
export {
  collisions,
  intersection,
  intersects
};
