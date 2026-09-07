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

// src/utils/wait.ts
var wait_exports = {};
__export(wait_exports, {
  waitForElement: () => import_dom_query2.waitForElement,
  waitForElementValue: () => waitForElementValue,
  waitForPromise: () => import_dom_query2.waitForPromise
});
module.exports = __toCommonJS(wait_exports);
var import_dom_query = require("@zag-js/dom-query");
var import_dom_query2 = require("@zag-js/dom-query");
function waitForElementValue(target, value, options) {
  const { timeout, rootNode } = options;
  const win = (0, import_dom_query.getWindow)(rootNode);
  const controller = new win.AbortController();
  return (0, import_dom_query.waitForPromise)(
    new Promise((resolve) => {
      const el = target();
      if (!el) return;
      const checkValue = () => {
        if (el.value === value) {
          resolve();
          el.removeEventListener("input", checkValue);
        }
      };
      checkValue();
      el.addEventListener("input", checkValue, { signal: controller.signal });
    }),
    controller,
    timeout
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  waitForElement,
  waitForElementValue,
  waitForPromise
});
