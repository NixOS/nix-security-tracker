import "../chunk-QZ7TP4HQ.mjs";

// src/utils/scroll-sides.ts
function getScrollSides(node, dir) {
  const scrollTop = node.scrollTop;
  const scrollLeft = node.scrollLeft;
  const isRtl = dir === "rtl";
  const threshold = 1;
  const hasVerticalScroll = node.scrollHeight - node.clientHeight > threshold;
  const hasHorizontalScroll = node.scrollWidth - node.clientWidth > threshold;
  const maxScrollLeft = node.scrollWidth - node.clientWidth;
  const maxScrollTop = node.scrollHeight - node.clientHeight;
  let atLeft = false;
  let atRight = false;
  let atTop = false;
  let atBottom = false;
  if (hasHorizontalScroll) {
    if (isRtl) {
      if (scrollLeft <= 0) {
        atLeft = Math.abs(scrollLeft) >= maxScrollLeft - threshold;
        atRight = Math.abs(scrollLeft) <= threshold;
      } else {
        atLeft = scrollLeft <= threshold;
        atRight = scrollLeft >= maxScrollLeft - threshold;
      }
    } else {
      atLeft = scrollLeft <= threshold;
      atRight = scrollLeft >= maxScrollLeft - threshold;
    }
  }
  if (hasVerticalScroll) {
    atTop = scrollTop <= threshold;
    atBottom = scrollTop >= maxScrollTop - threshold;
  }
  return {
    top: atTop,
    right: atRight,
    bottom: atBottom,
    left: atLeft
  };
}
export {
  getScrollSides
};
