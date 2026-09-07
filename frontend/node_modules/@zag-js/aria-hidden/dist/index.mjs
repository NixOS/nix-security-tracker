// src/index.ts
import { hideOthers } from "./aria-hidden.mjs";
var raf = (fn) => {
  const frameId = requestAnimationFrame(() => fn());
  return () => cancelAnimationFrame(frameId);
};
function ariaHidden(targetsOrFn, options = {}) {
  const { defer = true } = options;
  const func = defer ? raf : (v) => v();
  const cleanups = [];
  cleanups.push(
    func(() => {
      const targets = typeof targetsOrFn === "function" ? targetsOrFn() : targetsOrFn;
      const elements = targets.filter(Boolean);
      if (elements.length === 0) return;
      cleanups.push(hideOthers(elements));
    })
  );
  return () => {
    cleanups.forEach((fn) => fn?.());
  };
}
export {
  ariaHidden
};
