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

// src/set.ts
var set_exports = {};
__export(set_exports, {
  setAttribute: () => setAttribute,
  setProperty: () => setProperty,
  setStyle: () => setStyle,
  setStyleProperty: () => setStyleProperty
});
module.exports = __toCommonJS(set_exports);
var import_shared = require("./shared.js");
function setAttribute(el, attr, v) {
  const prev = el.getAttribute(attr);
  const exists = prev != null;
  if (prev === v) return import_shared.noop;
  el.setAttribute(attr, v);
  return () => {
    if (!exists) {
      el.removeAttribute(attr);
    } else {
      el.setAttribute(attr, prev);
    }
  };
}
function setProperty(el, prop, v) {
  const exists = prop in el;
  const prev = el[prop];
  if (prev === v) return import_shared.noop;
  el[prop] = v;
  return () => {
    if (!exists) {
      delete el[prop];
    } else {
      el[prop] = prev;
    }
  };
}
function setStyle(el, style) {
  if (!el) return import_shared.noop;
  const prev = Object.keys(style).reduce((acc, key) => {
    acc[key] = el.style.getPropertyValue(key);
    return acc;
  }, {});
  if (isEqual(prev, style)) return import_shared.noop;
  Object.assign(el.style, style);
  return () => {
    Object.assign(el.style, prev);
    if (el.style.length === 0) {
      el.removeAttribute("style");
    }
  };
}
function setStyleProperty(el, prop, value) {
  if (!el) return import_shared.noop;
  const prev = el.style.getPropertyValue(prop);
  if (prev === value) return import_shared.noop;
  el.style.setProperty(prop, value);
  return () => {
    el.style.setProperty(prop, prev);
    if (el.style.length === 0) {
      el.removeAttribute("style");
    }
  };
}
function isEqual(a, b) {
  return Object.keys(a).every((key) => a[key] === b[key]);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  setAttribute,
  setProperty,
  setStyle,
  setStyleProperty
});
