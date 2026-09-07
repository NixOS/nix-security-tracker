import "./chunk-QZ7TP4HQ.mjs";

// src/form.ts
import { getWindow } from "./node.mjs";
function getDescriptor(el, options) {
  const { type = "HTMLInputElement", property = "value" } = options;
  const proto = getWindow(el)[type].prototype;
  return Object.getOwnPropertyDescriptor(proto, property) ?? {};
}
function getElementType(el) {
  if (el.localName === "input") return "HTMLInputElement";
  if (el.localName === "textarea") return "HTMLTextAreaElement";
  if (el.localName === "select") return "HTMLSelectElement";
}
function setElementValue(el, value, property = "value") {
  if (!el) return;
  const type = getElementType(el);
  if (type) {
    const descriptor = getDescriptor(el, { type, property });
    descriptor.set?.call(el, value);
  }
  el.setAttribute(property, value);
}
function setElementChecked(el, checked) {
  if (!el) return;
  const descriptor = getDescriptor(el, { type: "HTMLInputElement", property: "checked" });
  descriptor.set?.call(el, checked);
  if (checked) el.setAttribute("checked", "");
  else el.removeAttribute("checked");
}
function dispatchInputValueEvent(el, options) {
  const { value, bubbles = true } = options;
  if (!el) return;
  const win = getWindow(el);
  if (!(el instanceof win.HTMLInputElement)) return;
  setElementValue(el, `${value}`);
  const event = new win.Event("input", { bubbles });
  el.dispatchEvent(markAsInternalChangeEvent(event));
}
function dispatchInputCheckedEvent(el, options) {
  const { checked, bubbles = true } = options;
  if (!el) return;
  const win = getWindow(el);
  if (!(el instanceof win.HTMLInputElement)) return;
  setElementChecked(el, checked);
  const event = new win.Event("click", { bubbles });
  el.dispatchEvent(markAsInternalChangeEvent(event));
}
function isFormElement(el) {
  return el.matches("textarea, input, select, button");
}
function trackFormReset(el, callback) {
  if (!el) return;
  const form = isFormElement(el) ? el.form : el.closest("form");
  const onReset = (e) => {
    if (e.defaultPrevented) return;
    callback();
  };
  form?.addEventListener("reset", onReset, { passive: true });
  return () => form?.removeEventListener("reset", onReset);
}
function trackFieldsetDisabled(el, callback) {
  const fieldset = el?.closest("fieldset");
  if (!fieldset) return;
  callback(fieldset.disabled);
  const win = getWindow(fieldset);
  const obs = new win.MutationObserver(() => callback(fieldset.disabled));
  obs.observe(fieldset, {
    attributes: true,
    attributeFilter: ["disabled"]
  });
  return () => obs.disconnect();
}
function trackFormControl(el, options) {
  if (!el) return;
  const { onFieldsetDisabledChange, onFormReset } = options;
  const cleanups = [trackFormReset(el, onFormReset), trackFieldsetDisabled(el, onFieldsetDisabledChange)];
  return () => cleanups.forEach((cleanup) => cleanup?.());
}
var INTERNAL_CHANGE_EVENT = /* @__PURE__ */ Symbol.for("zag.changeEvent");
function isInternalChangeEvent(e) {
  return Object.prototype.hasOwnProperty.call(e, INTERNAL_CHANGE_EVENT);
}
function markAsInternalChangeEvent(event) {
  if (isInternalChangeEvent(event)) return event;
  Object.defineProperty(event, INTERNAL_CHANGE_EVENT, { value: true });
  return event;
}
export {
  dispatchInputCheckedEvent,
  dispatchInputValueEvent,
  isInternalChangeEvent,
  markAsInternalChangeEvent,
  setElementChecked,
  setElementValue,
  trackFormControl
};
