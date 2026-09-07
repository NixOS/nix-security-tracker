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

// src/functions.ts
var functions_exports = {};
__export(functions_exports, {
  callAll: () => callAll,
  cast: () => cast,
  debounce: () => debounce,
  hash: () => hash,
  identity: () => identity,
  match: () => match,
  noop: () => noop,
  runIfFn: () => runIfFn,
  throttle: () => throttle,
  tryCatch: () => tryCatch,
  uuid: () => uuid
});
module.exports = __toCommonJS(functions_exports);
var import_guard = require("./guard.js");
var runIfFn = (v, ...a) => {
  const res = typeof v === "function" ? v(...a) : v;
  return res ?? void 0;
};
var cast = (v) => v;
var identity = (v) => v();
var noop = () => {
};
var callAll = (...fns) => (...a) => {
  fns.forEach(function(fn) {
    fn?.(...a);
  });
};
var uuid = /* @__PURE__ */ (() => {
  let id = 0;
  return () => {
    id++;
    return id.toString(36);
  };
})();
function match(key, record, ...args) {
  if (key in record) {
    const fn = record[key];
    return (0, import_guard.isFunction)(fn) ? fn(...args) : fn;
  }
  const error = new Error(`No matching key: ${JSON.stringify(key)} in ${JSON.stringify(Object.keys(record))}`);
  Error.captureStackTrace?.(error, match);
  throw error;
}
var tryCatch = (fn, fallback) => {
  try {
    return fn();
  } catch (error) {
    if (error instanceof Error) {
      Error.captureStackTrace?.(error, tryCatch);
    }
    return fallback?.();
  }
};
function throttle(fn, wait = 0) {
  let lastCall = 0;
  let timeout = null;
  return ((...args) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    if (timeSinceLastCall >= wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      fn(...args);
      lastCall = now;
    } else if (!timeout) {
      timeout = setTimeout(() => {
        fn(...args);
        lastCall = Date.now();
        timeout = null;
      }, wait - timeSinceLastCall);
    }
  });
}
function debounce(fn, wait = 0) {
  let timeout = null;
  return ((...args) => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => {
      fn(...args);
    }, wait);
  });
}
var toChar = (code) => String.fromCharCode(code + (code > 25 ? 39 : 97));
function toName(code) {
  let name = "";
  let x;
  for (x = Math.abs(code); x > 52; x = x / 52 | 0) name = toChar(x % 52) + name;
  return toChar(x % 52) + name;
}
function toPhash(h, x) {
  let i = x.length;
  while (i) h = h * 33 ^ x.charCodeAt(--i);
  return h;
}
var hash = (value) => toName(toPhash(5381, value) >>> 0);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  callAll,
  cast,
  debounce,
  hash,
  identity,
  match,
  noop,
  runIfFn,
  throttle,
  tryCatch,
  uuid
});
