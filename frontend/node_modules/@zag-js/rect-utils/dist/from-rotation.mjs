import "./chunk-QZ7TP4HQ.mjs";

// src/from-rotation.ts
import { createRect, getRectCorners } from "./rect.mjs";
function toRad(d) {
  return d % 360 * Math.PI / 180;
}
function rotate(a, d, c) {
  const r = toRad(d);
  const sin = Math.sin(r);
  const cos = Math.cos(r);
  const x = a.x - c.x;
  const y = a.y - c.y;
  return {
    x: c.x + x * cos - y * sin,
    y: c.y + x * sin + y * cos
  };
}
function getRotationRect(r, deg) {
  const rr = Object.values(getRectCorners(r)).map((p) => rotate(p, deg, r.center));
  const xs = rr.map((p) => p.x);
  const ys = rr.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return createRect({
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  });
}
export {
  getRotationRect,
  rotate,
  toRad
};
