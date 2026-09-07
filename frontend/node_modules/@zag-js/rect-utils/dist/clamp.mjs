import "./chunk-QZ7TP4HQ.mjs";

// src/clamp.ts
var clamp = (value, min, max) => Math.min(Math.max(value, min), max);
var clampPoint = (position, size, boundaryRect) => {
  const x = clamp(position.x, boundaryRect.x, boundaryRect.x + boundaryRect.width - size.width);
  const y = clamp(position.y, boundaryRect.y, boundaryRect.y + boundaryRect.height - size.height);
  return { x, y };
};
var defaultMinSize = {
  width: 0,
  height: 0
};
var defaultMaxSize = {
  width: Infinity,
  height: Infinity
};
var clampSize = (size, minSize = defaultMinSize, maxSize = defaultMaxSize) => {
  return {
    width: Math.min(Math.max(size.width, minSize.width), maxSize.width),
    height: Math.min(Math.max(size.height, minSize.height), maxSize.height)
  };
};
export {
  clampPoint,
  clampSize
};
