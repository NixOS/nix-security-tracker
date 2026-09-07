// src/utils/wait.ts
import { getWindow, waitForPromise } from "@zag-js/dom-query";
import { waitForElement, waitForPromise as waitForPromise2 } from "@zag-js/dom-query";
function waitForElementValue(target, value, options) {
  const { timeout, rootNode } = options;
  const win = getWindow(rootNode);
  const controller = new win.AbortController();
  return waitForPromise(
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
export {
  waitForElement,
  waitForElementValue,
  waitForPromise2 as waitForPromise
};
