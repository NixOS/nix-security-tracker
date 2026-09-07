import "./chunk-QZ7TP4HQ.mjs";

// src/union.ts
import { getRectFromPoints } from "./from-points.mjs";
var { min, max } = Math;
function union(...rs) {
  const pMin = {
    x: min(...rs.map((r) => r.minX)),
    y: min(...rs.map((r) => r.minY))
  };
  const pMax = {
    x: max(...rs.map((r) => r.maxX)),
    y: max(...rs.map((r) => r.maxY))
  };
  return getRectFromPoints(pMin, pMax);
}
export {
  union
};
