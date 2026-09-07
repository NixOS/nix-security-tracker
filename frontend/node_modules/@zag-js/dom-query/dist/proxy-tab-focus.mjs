import "./chunk-QZ7TP4HQ.mjs";

// src/proxy-tab-focus.ts
import { addDomEvent } from "./event.mjs";
import { contains, isActiveElement } from "./node.mjs";
import { raf } from "./raf.mjs";
import { getTabbableEdges, getTabbables } from "./tabbable.mjs";
function resolveElement(value) {
  if (value == null) return null;
  return typeof value === "function" ? value() : value;
}
function getNextTabbableAfterTrigger(container, trigger, getShadowRoot) {
  if (!trigger) return null;
  const tabbables = getTabbables(container.ownerDocument.body, { getShadowRoot });
  const triggerIndex = tabbables.indexOf(trigger);
  if (triggerIndex === -1) return null;
  for (let i = triggerIndex + 1; i < tabbables.length; i++) {
    const el = tabbables[i];
    if (!contains(container, el)) return el;
  }
  return null;
}
function proxyTabFocusImpl(container, options = {}) {
  const { triggerElement, onFocus, onFocusEnter, getShadowRoot } = options;
  const initial = resolveElement(container) ?? resolveElement(triggerElement);
  const doc = initial?.ownerDocument || document;
  function onKeyDown(event) {
    if (event.key !== "Tab") return;
    const content = resolveElement(container);
    const trigger = resolveElement(triggerElement);
    if (!content) return;
    const [firstTabbable, lastTabbable] = getTabbableEdges(content, { includeContainer: true, getShadowRoot });
    const noTabbableElements = !firstTabbable && !lastTabbable;
    let elementToFocus = null;
    if (event.shiftKey && (isActiveElement(firstTabbable) || noTabbableElements)) {
      elementToFocus = trigger;
    } else if (!event.shiftKey && isActiveElement(trigger)) {
      onFocusEnter?.();
      elementToFocus = firstTabbable;
    } else if (!event.shiftKey && (isActiveElement(lastTabbable) || noTabbableElements)) {
      elementToFocus = getNextTabbableAfterTrigger(content, trigger, getShadowRoot);
    } else if (event.shiftKey) {
      const nextTabbableAfterTrigger = getNextTabbableAfterTrigger(content, trigger, getShadowRoot);
      if (isActiveElement(nextTabbableAfterTrigger)) {
        onFocusEnter?.();
        elementToFocus = lastTabbable;
      }
    }
    if (!elementToFocus) return;
    event.preventDefault();
    if (typeof onFocus === "function") {
      onFocus(elementToFocus);
    } else {
      elementToFocus.focus();
    }
  }
  return addDomEvent(doc, "keydown", onKeyDown, true);
}
function proxyTabFocus(container, options) {
  const { defer, ...restOptions } = options;
  const func = defer ? raf : (v) => v();
  const cleanups = [];
  cleanups.push(
    func(() => {
      cleanups.push(proxyTabFocusImpl(container, restOptions));
    })
  );
  return () => {
    cleanups.forEach((fn) => fn?.());
  };
}
export {
  proxyTabFocus
};
