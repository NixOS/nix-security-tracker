"use client";

// src/bindable.ts
import { identity, isFunction } from "@zag-js/utils";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useSafeLayoutEffect } from "./use-layout-effect.mjs";
function useBindable(props) {
  const initial = props().value ?? props().defaultValue;
  const eq = props().isEqual ?? Object.is;
  const [initialValue] = useState(initial);
  const [value, setValue] = useState(initialValue);
  const controlled = props().value !== void 0;
  const valueRef = useRef(value);
  valueRef.current = controlled ? props().value : value;
  const prevValue = useRef(valueRef.current);
  useSafeLayoutEffect(() => {
    prevValue.current = valueRef.current;
  }, [value, props().value]);
  const setFn = (value2) => {
    const prev = prevValue.current;
    const next = isFunction(value2) ? value2(prev) : value2;
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
      const exec = props().sync ? flushSync : identity;
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
  useEffect(() => fn, []);
};
useBindable.ref = (defaultValue) => {
  const value = useRef(defaultValue);
  return {
    get: () => value.current,
    set: (next) => {
      value.current = next;
    }
  };
};
export {
  useBindable
};
