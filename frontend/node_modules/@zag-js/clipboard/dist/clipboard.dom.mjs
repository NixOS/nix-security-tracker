// src/clipboard.dom.ts
import { getWindow } from "@zag-js/dom-query";
var getRootId = (ctx) => ctx.ids?.root ?? `clip:${ctx.id}`;
var getInputId = (ctx) => ctx.ids?.input ?? `clip:${ctx.id}:input`;
var getLabelId = (ctx) => ctx.ids?.label ?? `clip:${ctx.id}:label`;
var getInputEl = (ctx) => ctx.getById(getInputId(ctx));
var writeToClipboard = (ctx, value) => copyText(ctx.getDoc(), value);
function createNode(doc, text) {
  const node = doc.createElement("pre");
  Object.assign(node.style, {
    width: "1px",
    height: "1px",
    position: "fixed",
    top: "5px"
  });
  node.textContent = text;
  return node;
}
function copyNode(node) {
  const win = getWindow(node);
  const selection = win.getSelection();
  if (selection == null) {
    return Promise.reject(new Error());
  }
  selection.removeAllRanges();
  const doc = node.ownerDocument;
  const range = doc.createRange();
  range.selectNodeContents(node);
  selection.addRange(range);
  doc.execCommand("copy");
  selection.removeAllRanges();
  return Promise.resolve();
}
function copyText(doc, text) {
  const win = doc.defaultView || window;
  if (win.navigator.clipboard?.writeText !== void 0) {
    return win.navigator.clipboard.writeText(text);
  }
  if (!doc.body) {
    return Promise.reject(new Error());
  }
  const node = createNode(doc, text);
  doc.body.appendChild(node);
  copyNode(node);
  doc.body.removeChild(node);
  return Promise.resolve();
}
export {
  getInputEl,
  getInputId,
  getLabelId,
  getRootId,
  writeToClipboard
};
