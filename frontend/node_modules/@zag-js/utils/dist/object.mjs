import "./chunk-MXGZDBDQ.mjs";

// src/object.ts
import { isPlainObject } from "./guard.mjs";
function compact(obj) {
  if (!isPlainObject(obj) || obj === void 0) return obj;
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
export {
  compact,
  createSplitProps,
  json,
  keys,
  mergeWithDefault,
  omit,
  pick,
  splitProps
};
