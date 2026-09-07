"use strict";
"use client";
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

// src/bindable.ts
var bindable_exports = {};
__export(bindable_exports, {
  useBindable: () => useBindable
});
module.exports = __toCommonJS(bindable_exports);
var import_utils = require("@zag-js/utils");
var import_react = require("react");
var import_react_dom = require("react-dom");
var import_use_layout_effect = require("./use-layout-effect.js");
function useBindable(props) {
  const initial = props().value ?? props().defaultValue;
  const eq = props().isEqual ?? Object.is;
  const [initialValue] = (0, import_react.useState)(initial);
  const [value, setValue] = (0, import_react.useState)(initialValue);
  const controlled = props().value !== void 0;
  const valueRef = (0, import_react.useRef)(value);
  valueRef.current = controlled ? props().value : value;
  const prevValue = (0, import_react.useRef)(valueRef.current);
  (0, import_use_layout_effect.useSafeLayoutEffect)(() => {
    prevValue.current = valueRef.current;
  }, [value, props().value]);
  const setFn = (value2) => {
    const prev = prevValue.current;
    const next = (0, import_utils.isFunction)(value2) ? value2(prev) : value2;
    if (props().debug) {
      console.log(`[bindable > ${props().debug}] setValue`, { next, prev });
    }
    if (!controlled) setValue(next);
    if (!eq(next, prev)) {
      props().onChange?.(next, prev);
    }
  };
  function get() {
    return controlled ? props().value : value;
  }
  return {
    initial: initialValue,
    ref: valueRef,
    get,
    set(value2) {
      const exec = props().sync ? import_react_dom.flushSync : import_utils.identity;
      exec(() => setFn(value2));
    },
    invoke(nextValue, prevValue2) {
      props().onChange?.(nextValue, prevValue2);
    },
    hash(value2) {
      return props().hash?.(value2) ?? String(value2);
    }
  };
}
useBindable.cleanup = (fn) => {
  (0, import_react.useEffect)(() => fn, []);
};
useBindable.ref = (defaultValue) => {
  const value = (0, import_react.useRef)(defaultValue);
  return {
    get: () => value.current,
    set: (next) => {
      value.current = next;
    }
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useBindable
});
