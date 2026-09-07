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

// src/object.ts
var object_exports = {};
__export(object_exports, {
  compact: () => compact,
  createSplitProps: () => createSplitProps,
  json: () => json,
  keys: () => keys,
  mergeWithDefault: () => mergeWithDefault,
  omit: () => omit,
  pick: () => pick,
  splitProps: () => splitProps
});
module.exports = __toCommonJS(object_exports);
var import_guard = require("./guard.js");
function compact(obj) {
  if (!(0, import_guard.isPlainObject)(obj) || obj === void 0) return obj;
  const keys2 = Reflect.ownKeys(obj).filter((key) => typeof key === "string");
  const filtered = {};
  for (const key of keys2) {
    const value = obj[key];
    if (value !== void 0) {
      filtered[key] = compact(value);
    }
  }
  return filtered;
}
var json = (v) => JSON.parse(JSON.stringify(v));
var keys = (obj) => Object.keys(obj);
function pick(obj, keys2) {
  const filtered = {};
  for (const key of keys2) {
    const value = obj[key];
    if (value !== void 0) {
      filtered[key] = value;
    }
  }
  return filtered;
}
function splitProps(props, keys2) {
  const rest = {};
  const result = {};
  const keySet = new Set(keys2);
  const ownKeys = Reflect.ownKeys(props);
  for (const key of ownKeys) {
    if (keySet.has(key)) {
      result[key] = props[key];
    } else {
      rest[key] = props[key];
    }
  }
  return [result, rest];
}
var createSplitProps = (keys2) => {
  return function split(props) {
    return splitProps(props, keys2);
  };
};
function omit(obj, keys2) {
  return createSplitProps(keys2)(obj)[1];
}
function mergeWithDefault(defaults, overrides) {
  if (!overrides) return defaults;
  const result = { ...defaults };
  const source = overrides;
  for (const key in source) {
    const value = source[key];
    if (value !== void 0) result[key] = value;
  }
  return result;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  compact,
  createSplitProps,
  json,
  keys,
  mergeWithDefault,
  omit,
  pick,
  splitProps
});
