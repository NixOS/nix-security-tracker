import "./chunk-QZ7TP4HQ.mjs";

// src/visually-hidden.ts
var visuallyHiddenStyle = {
  border: "0",
  clip: "rect(0 0 0 0)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: "0",
  position: "absolute",
  width: "1px",
  whiteSpace: "nowrap",
  wordWrap: "normal"
};
function setVisuallyHidden(el) {
  Object.assign(el.style, visuallyHiddenStyle);
}
export {
  setVisuallyHidden,
  visuallyHiddenStyle
};
