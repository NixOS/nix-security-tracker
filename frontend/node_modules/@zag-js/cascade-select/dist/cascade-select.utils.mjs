// src/cascade-select.utils.ts
import {
  isPointInPolygon,
  createPoint,
  createRect,
  getRectCorners,
  closestSideToPoint
} from "@zag-js/rect-utils";
function createGraceArea(exitPoint, triggerRect, targetRect, options = {}) {
  const { padding = 5 } = options;
  const triggerRectObj = createRect({
    x: triggerRect.left,
    y: triggerRect.top,
    width: triggerRect.width,
    height: triggerRect.height
  });
  const exitSide = closestSideToPoint(triggerRectObj, exitPoint);
  const paddedExitPoints = getPaddedExitPoints(exitPoint, exitSide, padding);
  const targetPoints = domRectToPoints(targetRect);
  return getConvexHull([...paddedExitPoints, ...targetPoints]);
}
function isPointerInGraceArea(point, graceArea) {
  return isPointInPolygon(graceArea, point);
}
function getPaddedExitPoints(exitPoint, exitSide, padding) {
  const { x, y } = exitPoint;
  switch (exitSide) {
    case "top":
      return [createPoint(x - padding, y + padding), createPoint(x + padding, y + padding)];
    case "bottom":
      return [createPoint(x - padding, y - padding), createPoint(x + padding, y - padding)];
    case "left":
      return [createPoint(x + padding, y - padding), createPoint(x + padding, y + padding)];
    case "right":
      return [createPoint(x - padding, y - padding), createPoint(x - padding, y + padding)];
    default:
      return [];
  }
}
function domRectToPoints(rect) {
  const rectObj = createRect({
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height
  });
  const corners = getRectCorners(rectObj);
  return [corners.top, corners.right, corners.bottom, corners.left];
}
function getConvexHull(points) {
  if (points.length <= 1) return points.slice();
  const sortedPoints = points.slice().sort((a, b) => {
    if (a.x !== b.x) return a.x - b.x;
    return a.y - b.y;
  });
  const lower = [];
  for (const point of sortedPoints) {
    while (lower.length >= 2 && crossProduct(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
      lower.pop();
    }
    lower.push(point);
  }
  const upper = [];
  for (let i = sortedPoints.length - 1; i >= 0; i--) {
    const point = sortedPoints[i];
    while (upper.length >= 2 && crossProduct(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
      upper.pop();
    }
    upper.push(point);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}
function crossProduct(o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}
export {
  createGraceArea,
  isPointerInGraceArea
};
