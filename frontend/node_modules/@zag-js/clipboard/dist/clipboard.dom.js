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

// src/clipboard.dom.ts
var clipboard_dom_exports = {};
__export(clipboard_dom_exports, {
  getInputEl: () => getInputEl,
  getInputId: () => getInputId,
  getLabelId: () => getLabelId,
  getRootId: () => getRootId,
  writeToClipboard: () => writeToClipboard
});
module.exports = __toCommonJS(clipboard_dom_exports);
var import_dom_query = require("@zag-js/dom-query");
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
  const win = (0, import_dom_query.getWindow)(node);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getInputEl,
  getInputId,
  getLabelId,
  getRootId,
  writeToClipboard
});
