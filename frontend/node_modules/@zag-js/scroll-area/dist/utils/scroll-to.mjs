import "../chunk-QZ7TP4HQ.mjs";

// src/utils/scroll-to.ts
import { compact } from "@zag-js/utils";
import { smoothScroll } from "./smooth-scroll.mjs";
function scrollTo(node, options = {}) {
  if (!node) return;
  const { top, left, behavior = "smooth", easing, duration } = options;
  if (behavior === "smooth") {
    smoothScroll(node, { top, left, easing, duration });
  } else {
    const scrollOptions = compact({ behavior, top, left });
    node.scrollTo(scrollOptions);
  }
}
export {
  scrollTo
};
