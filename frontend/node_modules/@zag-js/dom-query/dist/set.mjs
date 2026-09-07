import "./chunk-QZ7TP4HQ.mjs";

// src/set.ts
import { noop } from "./shared.mjs";
function setAttribute(el, attr, v) {
  const prev = el.getAttribute(attr);
  const exists = prev != null;
  if (prev === v) return noop;
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
  if (prev === v) return noop;
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
  if (!el) return noop;
  const prev = Object.keys(style).reduce((acc, key) => {
    acc[key] = el.style.getPropertyValue(key);
    return acc;
  }, {});
  if (isEqual(prev, style)) return noop;
  Object.assign(el.style, style);
  return () => {
    Object.assign(el.style, prev);
    if (el.style.length === 0) {
      el.removeAttribute("style");
    }
  };
}
function setStyleProperty(el, prop, value) {
  if (!el) return noop;
  const prev = el.style.getPropertyValue(prop);
  if (prev === value) return noop;
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
export {
  setAttribute,
  setProperty,
  setStyle,
  setStyleProperty
};
