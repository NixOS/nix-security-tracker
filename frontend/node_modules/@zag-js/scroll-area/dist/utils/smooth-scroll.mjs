import "../chunk-QZ7TP4HQ.mjs";

// src/utils/smooth-scroll.ts
var DURATION = 300;
var EASE_OUT_QUAD = (t) => t * (2 - t);
function smoothScroll(node, options = {}) {
  const { top, left, duration = DURATION, easing = EASE_OUT_QUAD, onComplete } = options;
  if (!node) return;
  const state = {
    startTime: 0,
    startScrollTop: node.scrollTop,
    startScrollLeft: node.scrollLeft,
    targetScrollTop: top ?? node.scrollTop,
    targetScrollLeft: left ?? node.scrollLeft
  };
  let cancelled = false;
  const cleanup = () => {
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = void 0;
    }
    cancelled = true;
  };
  const animate = (currentTime) => {
    if (cancelled) return;
    if (state.startTime === 0) {
      state.startTime = currentTime;
    }
    const elapsed = currentTime - state.startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);
    const deltaTop = state.targetScrollTop - state.startScrollTop;
    const deltaLeft = state.targetScrollLeft - state.startScrollLeft;
    node.scrollTop = state.startScrollTop + deltaTop * easedProgress;
    node.scrollLeft = state.startScrollLeft + deltaLeft * easedProgress;
    if (progress < 1) {
      state.rafId = requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  };
  state.rafId = requestAnimationFrame(animate);
  return cleanup;
}
export {
  smoothScroll
};
