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

// src/form.ts
var form_exports = {};
__export(form_exports, {
  dispatchInputCheckedEvent: () => dispatchInputCheckedEvent,
  dispatchInputValueEvent: () => dispatchInputValueEvent,
  isInternalChangeEvent: () => isInternalChangeEvent,
  markAsInternalChangeEvent: () => markAsInternalChangeEvent,
  setElementChecked: () => setElementChecked,
  setElementValue: () => setElementValue,
  trackFormControl: () => trackFormControl
});
module.exports = __toCommonJS(form_exports);
var import_node = require("./node.js");
function getDescriptor(el, options) {
  const { type = "HTMLInputElement", property = "value" } = options;
  const proto = (0, import_node.getWindow)(el)[type].prototype;
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
  const win = (0, import_node.getWindow)(el);
  if (!(el instanceof win.HTMLInputElement)) return;
  setElementValue(el, `${value}`);
  const event = new win.Event("input", { bubbles });
  el.dispatchEvent(markAsInternalChangeEvent(event));
}
function dispatchInputCheckedEvent(el, options) {
  const { checked, bubbles = true } = options;
  if (!el) return;
  const win = (0, import_node.getWindow)(el);
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
  const win = (0, import_node.getWindow)(fieldset);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  dispatchInputCheckedEvent,
  dispatchInputValueEvent,
  isInternalChangeEvent,
  markAsInternalChangeEvent,
  setElementChecked,
  setElementValue,
  trackFormControl
});
