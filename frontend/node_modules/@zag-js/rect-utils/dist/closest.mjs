import "./chunk-QZ7TP4HQ.mjs";

// src/closest.ts
import { distance } from "./distance.mjs";
function closest(...pts) {
  return (a) => {
    const ds = pts.map((b) => distance(b, a));
    const c = Math.min.apply(Math, ds);
    return pts[ds.indexOf(c)];
  };
}
function closestSideToRect(ref, r) {
  if (r.maxX <= ref.minX) return "left";
  if (r.minX >= ref.maxX) return "right";
  if (r.maxY <= ref.minY) return "top";
  if (r.minY >= ref.maxY) return "bottom";
  return "left";
}
function closestSideToPoint(ref, p) {
  const { x, y } = p;
  const dl = x - ref.minX;
  const dr = ref.maxX - x;
  const dt = y - ref.minY;
  const db = ref.maxY - y;
  let closest2 = dl;
  let side = "left";
  if (dr < closest2) {
    closest2 = dr;
    side = "right";
  }
  if (dt < closest2) {
    closest2 = dt;
    side = "top";
  }
  if (db < closest2) {
    side = "bottom";
  }
  return side;
}
export {
  closest,
  closestSideToPoint,
  closestSideToRect
};
