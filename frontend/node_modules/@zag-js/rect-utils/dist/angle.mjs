import "./chunk-QZ7TP4HQ.mjs";

// src/angle.ts
function getPointAngle(rect, point, reference = rect.center) {
  const x = point.x - reference.x;
  const y = point.y - reference.y;
  const deg = Math.atan2(x, y) * (180 / Math.PI) + 180;
  return 360 - deg;
}
export {
  getPointAngle
};
