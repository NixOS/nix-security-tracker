import "./chunk-QZ7TP4HQ.mjs";

// src/wait-for.ts
import { getDocument, getWindow } from "./node.mjs";
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
  const win = getWindow(rootNode);
  const doc = getDocument(rootNode);
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
export {
  waitForElement,
  waitForEvent,
  waitForPromise
};
