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

// src/tabbable.ts
var tabbable_exports = {};
__export(tabbable_exports, {
  getFirstFocusable: () => getFirstFocusable,
  getFirstTabbable: () => getFirstTabbable,
  getFocusables: () => getFocusables,
  getLastTabbable: () => getLastTabbable,
  getNextTabbable: () => getNextTabbable,
  getTabIndex: () => getTabIndex,
  getTabbableEdges: () => getTabbableEdges,
  getTabbables: () => getTabbables,
  isFocusable: () => isFocusable,
  isTabbable: () => isTabbable
});
module.exports = __toCommonJS(tabbable_exports);
var import_node = require("./node.js");
var isFrame = (el) => (0, import_node.isHTMLElement)(el) && el.tagName === "IFRAME";
var NATURALLY_TABBABLE_REGEX = /^(audio|video|details)$/;
function parseTabIndex(el) {
  const attr = el.getAttribute("tabindex");
  if (!attr) return NaN;
  return parseInt(attr, 10);
}
var hasTabIndex = (el) => !Number.isNaN(parseTabIndex(el));
var hasNegativeTabIndex = (el) => parseTabIndex(el) < 0;
function isRadioInput(element) {
  return (0, import_node.isInputElement)(element) && element.type === "radio";
}
function isTabbableRadio(element) {
  if (!isRadioInput(element) || !element.name) return true;
  if (element.checked) return true;
  const selector = `input[type="radio"][name="${CSS.escape(element.name)}"]`;
  const scope = element.form ?? element.ownerDocument;
  const group = Array.from(scope.querySelectorAll(selector)).filter(
    (radio) => radio.form === element.form && isFocusable(radio)
  );
  const checked = group.find((radio) => radio.checked);
  if (checked) return checked === element;
  return group[0] === element;
}
function getShadowRootForNode(element, getShadowRoot) {
  if (!getShadowRoot) return null;
  if (getShadowRoot === true) {
    return element.shadowRoot || null;
  }
  const result = getShadowRoot(element);
  return (result === true ? element.shadowRoot : result) || null;
}
function collectElementsWithShadowDOM(elements, getShadowRoot, filterFn) {
  const allElements = [...elements];
  const toProcess = [...elements];
  const processed = /* @__PURE__ */ new Set();
  const positionMap = /* @__PURE__ */ new Map();
  elements.forEach((el, i) => positionMap.set(el, i));
  let processIndex = 0;
  while (processIndex < toProcess.length) {
    const element = toProcess[processIndex++];
    if (!element || processed.has(element)) continue;
    processed.add(element);
    const shadowRoot = getShadowRootForNode(element, getShadowRoot);
    if (shadowRoot) {
      const shadowElements = Array.from(shadowRoot.querySelectorAll(focusableSelector)).filter(filterFn);
      const hostIndex = positionMap.get(element);
      if (hostIndex !== void 0) {
        const insertPosition = hostIndex + 1;
        allElements.splice(insertPosition, 0, ...shadowElements);
        shadowElements.forEach((el, i) => {
          positionMap.set(el, insertPosition + i);
        });
        for (let i = insertPosition + shadowElements.length; i < allElements.length; i++) {
          positionMap.set(allElements[i], i);
        }
      } else {
        const insertPosition = allElements.length;
        allElements.push(...shadowElements);
        shadowElements.forEach((el, i) => {
          positionMap.set(el, insertPosition + i);
        });
      }
      toProcess.push(...shadowElements);
    }
  }
  return allElements;
}
var focusableSelector = "input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], iframe, object, embed, area[href], audio[controls], video[controls], [contenteditable]:not([contenteditable='false']), details > summary:first-of-type";
var getFocusables = (container, options = {}) => {
  if (!container) return [];
  const { includeContainer = false, getShadowRoot } = options;
  const elements = Array.from(container.querySelectorAll(focusableSelector));
  const include = includeContainer == true || includeContainer == "if-empty" && elements.length === 0;
  if (include && (0, import_node.isHTMLElement)(container) && isFocusable(container)) {
    elements.unshift(container);
  }
  const focusableElements = [];
  for (const element of elements) {
    if (!isFocusable(element)) continue;
    if (isFrame(element) && element.contentDocument) {
      const frameBody = element.contentDocument.body;
      focusableElements.push(...getFocusables(frameBody, { getShadowRoot }));
      continue;
    }
    focusableElements.push(element);
  }
  if (getShadowRoot) {
    return collectElementsWithShadowDOM(focusableElements, getShadowRoot, isFocusable);
  }
  return focusableElements;
};
function isFocusable(element) {
  if (!(0, import_node.isHTMLElement)(element) || element.closest("[inert]")) return false;
  return element.matches(focusableSelector) && (0, import_node.isElementVisible)(element);
}
function getFirstFocusable(container, options = {}) {
  const [first] = getFocusables(container, options);
  return first || null;
}
function getTabbables(container, options = {}) {
  if (!container) return [];
  const { includeContainer, getShadowRoot } = options;
  const elements = Array.from(container.querySelectorAll(focusableSelector));
  if (includeContainer && isTabbable(container)) {
    elements.unshift(container);
  }
  const tabbableElements = [];
  for (const element of elements) {
    if (!isTabbable(element)) continue;
    if (isFrame(element) && element.contentDocument) {
      const frameBody = element.contentDocument.body;
      tabbableElements.push(...getTabbables(frameBody, { getShadowRoot }));
      continue;
    }
    tabbableElements.push(element);
  }
  if (getShadowRoot) {
    const allElements = collectElementsWithShadowDOM(tabbableElements, getShadowRoot, isTabbable);
    if (!allElements.length && includeContainer) {
      return elements;
    }
    return allElements;
  }
  if (!tabbableElements.length && includeContainer) {
    return elements;
  }
  return tabbableElements;
}
function isTabbable(el) {
  if ((0, import_node.isHTMLElement)(el) && el.tabIndex > 0) return true;
  if (!isFocusable(el) || hasNegativeTabIndex(el)) return false;
  return isTabbableRadio(el);
}
function getFirstTabbable(container, options = {}) {
  const [first] = getTabbables(container, options);
  return first || null;
}
function getLastTabbable(container, options = {}) {
  const elements = getTabbables(container, options);
  return elements[elements.length - 1] || null;
}
function getTabbableEdges(container, options = {}) {
  const elements = getTabbables(container, options);
  const first = elements[0] || null;
  const last = elements[elements.length - 1] || null;
  return [first, last];
}
function getNextTabbable(container, options = {}) {
  const { current, getShadowRoot } = options;
  const tabbables = getTabbables(container, { getShadowRoot });
  const doc = container?.ownerDocument || document;
  const currentElement = current ?? (0, import_node.getActiveElement)(doc);
  if (!currentElement) return null;
  const index = tabbables.indexOf(currentElement);
  return tabbables[index + 1] || null;
}
function getTabIndex(node) {
  if (node.tabIndex < 0) {
    if ((NATURALLY_TABBABLE_REGEX.test(node.localName) || (0, import_node.isEditableElement)(node)) && !hasTabIndex(node)) {
      return 0;
    }
  }
  return node.tabIndex;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getFirstFocusable,
  getFirstTabbable,
  getFocusables,
  getLastTabbable,
  getNextTabbable,
  getTabIndex,
  getTabbableEdges,
  getTabbables,
  isFocusable,
  isTabbable
});
