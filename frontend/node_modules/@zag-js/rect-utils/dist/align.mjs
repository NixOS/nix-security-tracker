import "./chunk-QZ7TP4HQ.mjs";

// src/align.ts
function hAlign(a, ref, h) {
  let x = ref.minX;
  if (h === "left-inside") x = ref.minX;
  if (h === "left-outside") x = ref.minX - ref.width;
  if (h === "right-inside") x = ref.maxX - ref.width;
  if (h === "right-outside") x = ref.maxX;
  if (h === "center") x = ref.midX - ref.width / 2;
  return { ...a, x };
}
function vAlign(a, ref, v) {
  let y = ref.minY;
  if (v === "top-inside") y = ref.minY;
  if (v === "top-outside") y = ref.minY - a.height;
  if (v === "bottom-inside") y = ref.maxY - a.height;
  if (v === "bottom-outside") y = ref.maxY;
  if (v === "center") y = ref.midY - a.height / 2;
  return { ...a, y };
}
function alignRect(a, ref, options) {
  const { h, v } = options;
  return vAlign(hAlign(a, ref, h), ref, v);
}
export {
  alignRect
};
