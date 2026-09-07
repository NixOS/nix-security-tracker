import "./chunk-QZ7TP4HQ.mjs";

// src/rect.ts
var createPoint = (x, y) => ({ x, y });
var subtractPoints = (a, b) => {
  if (!b) return a;
  return createPoint(a.x - b.x, a.y - b.y);
};
var addPoints = (a, b) => createPoint(a.x + b.x, a.y + b.y);
function isPoint(v) {
  return Reflect.has(v, "x") && Reflect.has(v, "y");
}
function createRect(r) {
  const { x, y, width, height } = r;
  const midX = x + width / 2;
  const midY = y + height / 2;
  return {
    x,
    y,
    width,
    height,
    minX: x,
    minY: y,
    maxX: x + width,
    maxY: y + height,
    midX,
    midY,
    center: createPoint(midX, midY)
  };
}
function isRect(v) {
  return Reflect.has(v, "x") && Reflect.has(v, "y") && Reflect.has(v, "width") && Reflect.has(v, "height");
}
function getRectCenters(v) {
  const top = createPoint(v.midX, v.minY);
  const right = createPoint(v.maxX, v.midY);
  const bottom = createPoint(v.midX, v.maxY);
  const left = createPoint(v.minX, v.midY);
  return { top, right, bottom, left };
}
function getRectCorners(v) {
  const top = createPoint(v.minX, v.minY);
  const right = createPoint(v.maxX, v.minY);
  const bottom = createPoint(v.maxX, v.maxY);
  const left = createPoint(v.minX, v.maxY);
  return { top, right, bottom, left };
}
function getRectEdges(v) {
  const c = getRectCorners(v);
  const top = [c.top, c.right];
  const right = [c.right, c.bottom];
  const bottom = [c.left, c.bottom];
  const left = [c.top, c.left];
  return { top, right, bottom, left };
}
export {
  addPoints,
  createPoint,
  createRect,
  getRectCenters,
  getRectCorners,
  getRectEdges,
  isPoint,
  isRect,
  subtractPoints
};
