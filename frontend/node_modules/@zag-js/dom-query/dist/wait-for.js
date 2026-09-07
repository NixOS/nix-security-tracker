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

// src/wait-for.ts
var wait_for_exports = {};
__export(wait_for_exports, {
  waitForElement: () => waitForElement,
  waitForEvent: () => waitForEvent,
  waitForPromise: () => waitForPromise
});
module.exports = __toCommonJS(wait_for_exports);
var import_node = require("./node.js");
function waitForPromise(promise, controller, timeout) {
  const { signal } = controller;
  const wrappedPromise = new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout of ${timeout}ms exceeded`));
    }, timeout);
    signal.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      reject(new DOMException("Promise aborted", "AbortError"));
    });
    promise.then((result) => {
      if (!signal.aborted) {
        clearTimeout(timeoutId);
        resolve(result);
      }
    }).catch((error) => {
      if (!signal.aborted) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  });
  const abort = () => controller.abort();
  return [wrappedPromise, abort];
}
function waitForElement(target, options) {
  const { timeout, rootNode } = options;
  const win = (0, import_node.getWindow)(rootNode);
  const doc = (0, import_node.getDocument)(rootNode);
  const controller = new win.AbortController();
  return waitForPromise(
    new Promise((resolve) => {
      const el = target();
      if (el) {
        resolve(el);
        return;
      }
      const observer = new win.MutationObserver(() => {
        const el2 = target();
        if (el2 && el2.isConnected) {
          observer.disconnect();
          resolve(el2);
        }
      });
      observer.observe(doc.body, {
        childList: true,
        subtree: true
      });
    }),
    controller,
    timeout
  );
}
function waitForEvent(target, event, options) {
  let cleanup;
  const { predicate, ...listenerOptions } = options ?? {};
  const promise = new Promise((resolve) => {
    const element = target?.();
    if (!element) {
      return;
    }
    const handler = (e) => {
      if (!predicate || predicate(element)) {
        resolve(e);
        cleanup?.();
      }
    };
    element.addEventListener(event, handler, listenerOptions);
    cleanup = () => element.removeEventListener(event, handler, listenerOptions);
  });
  return [promise, () => cleanup?.()];
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  waitForElement,
  waitForEvent,
  waitForPromise
});
