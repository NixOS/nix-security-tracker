import "../chunk-QZ7TP4HQ.mjs";

// src/utils/scroll-to-edge.ts
import { compact } from "@zag-js/utils";
import { smoothScroll } from "./smooth-scroll.mjs";
function scrollToEdge(node, edge, dir, behavior = "smooth", easing, duration) {
  if (!node) return;
  const maxLeft = node.scrollWidth - node.clientWidth;
  const maxTop = node.scrollHeight - node.clientHeight;
  const isRtl = dir === "rtl";
  let targetScrollTop;
  let targetScrollLeft;
  switch (edge) {
    case "top":
      targetScrollTop = 0;
      break;
    case "bottom":
      targetScrollTop = maxTop;
      break;
    case "left":
      if (isRtl) {
        const negative = node.scrollLeft <= 0;
        targetScrollLeft = negative ? -maxLeft : 0;
      } else {
        targetScrollLeft = 0;
      }
      break;
    case "right":
      if (isRtl) {
        const negative = node.scrollLeft <= 0;
        targetScrollLeft = negative ? 0 : maxLeft;
      } else {
        targetScrollLeft = maxLeft;
      }
      break;
  }
  if (behavior === "smooth") {
    smoothScroll(node, { top: targetScrollTop, left: targetScrollLeft, easing, duration });
  } else {
    const options = compact({ left: targetScrollLeft, top: targetScrollTop, behavior });
    node.scrollTo(options);
  }
}
export {
  scrollToEdge
};
