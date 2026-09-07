"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/polygon.ts
var polygon_exports = {};
__export(polygon_exports, {
  debugPolygon: () => debugPolygon,
  getElementPolygon: () => getElementPolygon,
  isPointInPolygon: () => isPointInPolygon
});
module.exports = __toCommonJS(polygon_exports);
var import_rect = require("./rect.js");
function getElementPolygon(rectValue, placement) {
  const rect = (0, import_rect.createRect)(rectValue);
  const { top, right, left, bottom } = (0, import_rect.getRectCorners)(rect);
  const [base] = placement.split("-");
  return {
    top: [left, top, right, bottom],
    right: [top, right, bottom, left],
    bottom: [top, left, bottom, right],
    left: [right, top, left, bottom]
  }[base];
}
function isPointInPolygon(polygon, point) {
  const { x, y } = point;
  let c = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    if (yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi) {
      c = !c;
    }
  }
  return c;
}
function createPolygonElement() {
  const id = "debug-polygon";
  const existingPolygon = document.getElementById(id);
  if (existingPolygon) {
    return existingPolygon;
  }
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  Object.assign(svg.style, {
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    opacity: "0.15",
    position: "fixed",
    pointerEvents: "none",
    fill: "red"
  });
  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygon.setAttribute("id", id);
  polygon.setAttribute("points", "0,0 0,0");
  svg.appendChild(polygon);
  document.body.appendChild(svg);
  return polygon;
}
function debugPolygon(polygon) {
  const el = createPolygonElement();
  const points = polygon.map((point) => `${point.x},${point.y}`).join(" ");
  el.setAttribute("points", points);
  return () => {
    el.remove();
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  debugPolygon,
  getElementPolygon,
  isPointInPolygon
});
