import "./chunk-QZ7TP4HQ.mjs";

// src/from-points.ts
import { createRect } from "./rect.mjs";
function getRectFromPoints(...pts) {
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  const width = Math.max(...xs) - x;
  const height = Math.max(...ys) - y;
  return createRect({ x, y, width, height });
}
export {
  getRectFromPoints
};
