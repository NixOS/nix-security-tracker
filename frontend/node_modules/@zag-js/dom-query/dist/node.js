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

// src/node.ts
var node_exports = {};
__export(node_exports, {
  contains: () => contains,
  getActiveElement: () => getActiveElement,
  getAncestorElements: () => getAncestorElements,
  getDocument: () => getDocument,
  getDocumentElement: () => getDocumentElement,
  getNodeName: () => getNodeName,
  getParentElement: () => getParentElement,
  getParentNode: () => getParentNode,
  getRootNode: () => getRootNode,
  getWindow: () => getWindow,
  isActiveElement: () => isActiveElement,
  isAnchorElement: () => isAnchorElement,
  isDocument: () => isDocument,
  isEditableElement: () => isEditableElement,
  isElement: () => isElement,
  isElementVisible: () => isElementVisible,
  isHTMLElement: () => isHTMLElement,
  isInputElement: () => isInputElement,
  isNode: () => isNode,
  isRootElement: () => isRootElement,
  isShadowRoot: () => isShadowRoot,
  isVisualViewport: () => isVisualViewport,
  isWindow: () => isWindow
});
module.exports = __toCommonJS(node_exports);
var import_shared = require("./shared.js");
var ELEMENT_NODE = 1;
var DOCUMENT_NODE = 9;
var DOCUMENT_FRAGMENT_NODE = 11;
var isElement = (el) => (0, import_shared.isObject)(el) && el.nodeType === ELEMENT_NODE && typeof el.nodeName === "string";
var isHTMLElement = (el) => (0, import_shared.isObject)(el) && el.nodeType === ELEMENT_NODE && typeof el.nodeName === "string";
var isDocument = (el) => (0, import_shared.isObject)(el) && el.nodeType === DOCUMENT_NODE;
var isWindow = (el) => (0, import_shared.isObject)(el) && el === el.window;
var isVisualViewport = (el) => (0, import_shared.isObject)(el) && el.constructor.name === "VisualViewport";
var getNodeName = (node) => {
  if (isHTMLElement(node)) return node.localName || "";
  return "#document";
};
function isRootElement(node) {
  return ["html", "body", "#document"].includes(getNodeName(node));
}
var isNode = (el) => (0, import_shared.isObject)(el) && el.nodeType !== void 0;
var isShadowRoot = (el) => isNode(el) && el.nodeType === DOCUMENT_FRAGMENT_NODE && "host" in el;
var isInputElement = (el) => isHTMLElement(el) && el.localName === "input";
var isAnchorElement = (el) => !!el?.matches("a[href]");
var isElementVisible = (el) => {
  if (!isHTMLElement(el)) return false;
  return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
};
function isActiveElement(element) {
  if (!element) return false;
  const rootNode = element.getRootNode();
  return getActiveElement(rootNode) === element;
}
var TEXTAREA_SELECT_REGEX = /(textarea|select)/;
function isEditableElement(el) {
  if (el == null || !isHTMLElement(el)) return false;
  try {
    return isInputElement(el) && el.selectionStart != null || TEXTAREA_SELECT_REGEX.test(el.localName) || el.isContentEditable || el.getAttribute("contenteditable") === "true" || el.getAttribute("contenteditable") === "";
  } catch {
    return false;
  }
}
function getParentElement(node) {
  const parentNode = node.parentNode;
  if (isShadowRoot(parentNode)) return parentNode.host;
  return parentNode;
}
function getAncestorElements(node) {
  const ancestors = [];
  while (node) {
    ancestors.push(node);
    node = getParentElement(node);
  }
  return ancestors;
}
function contains(parent, child) {
  if (!parent || !child) return false;
  if (!isHTMLElement(parent) || !isNode(child)) return false;
  if (isHTMLElement(child) && parent === child) return true;
  if (parent.contains(child)) return true;
  const rootNode = child.getRootNode?.();
  if (rootNode && isShadowRoot(rootNode)) {
    let next = child;
    while (next) {
      if (parent === next) return true;
      next = next.parentNode || next.host;
    }
  }
  return false;
}
function getDocument(el) {
  if (isDocument(el)) return el;
  if (isWindow(el)) return el.document;
  return el?.ownerDocument ?? document;
}
function getDocumentElement(el) {
  return getDocument(el).documentElement;
}
function getWindow(el) {
  if (isShadowRoot(el)) return getWindow(el.host);
  if (isDocument(el)) return el.defaultView ?? window;
  if (isHTMLElement(el)) return el.ownerDocument?.defaultView ?? window;
  return window;
}
function getActiveElement(rootNode) {
  let activeElement = rootNode.activeElement;
  while (activeElement?.shadowRoot) {
    const el = activeElement.shadowRoot.activeElement;
    if (!el || el === activeElement) break;
    else activeElement = el;
  }
  return activeElement;
}
function getParentNode(node) {
  if (getNodeName(node) === "html") return node;
  const result = node.assignedSlot || node.parentNode || isShadowRoot(node) && node.host || getDocumentElement(node);
  return isShadowRoot(result) ? result.host : result;
}
function getRootNode(node) {
  let result;
  try {
    result = node.getRootNode({ composed: true });
    if (isDocument(result) || isShadowRoot(result)) return result;
  } catch {
  }
  return node.ownerDocument ?? document;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  contains,
  getActiveElement,
  getAncestorElements,
  getDocument,
  getDocumentElement,
  getNodeName,
  getParentElement,
  getParentNode,
  getRootNode,
  getWindow,
  isActiveElement,
  isAnchorElement,
  isDocument,
  isEditableElement,
  isElement,
  isElementVisible,
  isHTMLElement,
  isInputElement,
  isNode,
  isRootElement,
  isShadowRoot,
  isVisualViewport,
  isWindow
});
