import "./chunk-QZ7TP4HQ.mjs";

// src/constrain.ts
var constrainRect = (rect, boundary) => {
  const left = Math.max(boundary.x, Math.min(rect.x, boundary.x + boundary.width - rect.width));
  const top = Math.max(boundary.y, Math.min(rect.y, boundary.y + boundary.height - rect.height));
  return {
    x: left,
    y: top,
    width: Math.min(rect.width, boundary.width),
    height: Math.min(rect.height, boundary.height)
  };
};
export {
  constrainRect
};
