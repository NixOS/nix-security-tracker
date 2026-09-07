// src/highlight.ts
import { highlightFirst } from "./highlight-first.mjs";
import { highlightMultiple } from "./highlight-multiple.mjs";
var highlightWord = (props) => {
  if (props.matchAll == null) {
    props.matchAll = Array.isArray(props.query);
  }
  if (!props.matchAll && Array.isArray(props.query)) {
    throw new Error("matchAll must be true when using multiple queries");
  }
  return props.matchAll ? highlightMultiple(props) : highlightFirst(props);
};
export {
  highlightWord
};
