// src/get-placement.ts
import { arrow, autoUpdate, computePosition, flip, hide, limitShift, offset, shift, size } from "@floating-ui/dom";
import { getComputedStyle, getWindow, isHTMLElement, raf } from "@zag-js/dom-query";
import { compact, isNull, noop } from "@zag-js/utils";
import { getAnchorElement } from "./get-anchor.mjs";
import { createTransformOriginMiddleware, rectMiddleware, shiftArrowMiddleware } from "./middleware.mjs";
import { getPlacementDetails } from "./placement.mjs";
var defaultOptions = {
  strategy: "absolute",
  placement: "bottom",
  listeners: true,
  restoreStyles: false,
  applyStyles: true,
  gutter: 8,
  flip: true,
  slide: true,
  overlap: false,
  sameWidth: false,
  fitViewport: false,
  overflowPadding: 8,
  arrowPadding: 4
};
function roundByDpr(win, value) {
  const dpr = win.devicePixelRatio || 1;
  return Math.round(value * dpr) / dpr;
}
function isApproximatelyEqual(a, b) {
  return a != null && Math.abs(a - b) < 0.5;
}
function resolveBoundaryOption(boundary) {
  if (typeof boundary === "function") return boundary();
  if (boundary === "clipping-ancestors") return "clippingAncestors";
  return boundary;
}
function getArrowMiddleware(arrowElement, doc, opts) {
  const element = arrowElement || doc.createElement("div");
  return arrow({ element, padding: opts.arrowPadding });
}
function getOffsetMiddleware(arrowElement, opts) {
  if (isNull(opts.offset ?? opts.gutter)) return;
  return offset(({ placement }) => {
    const arrowOffset = (arrowElement?.clientHeight || 0) / 2;
    const gutter = opts.offset?.mainAxis ?? opts.gutter;
    const mainAxis = typeof gutter === "number" ? gutter + arrowOffset : gutter ?? arrowOffset;
    const { hasAlign } = getPlacementDetails(placement);
    const shift2 = !hasAlign ? opts.shift : void 0;
    const crossAxis = opts.offset?.crossAxis ?? shift2;
    return compact({
      crossAxis,
      mainAxis,
      alignmentAxis: opts.shift
    });
  });
}
function getFlipMiddleware(opts) {
  if (!opts.flip) return;
  return flip(() => {
    const boundary = resolveBoundaryOption(opts.boundary);
    return {
      ...boundary ? { boundary } : void 0,
      padding: opts.overflowPadding,
      fallbackPlacements: opts.flip === true ? void 0 : opts.flip
    };
  });
}
function getShiftMiddleware(opts) {
  if (!opts.slide && !opts.overlap) return;
  return shift(() => {
    const boundary = resolveBoundaryOption(opts.boundary);
    return {
      ...boundary ? { boundary } : void 0,
      mainAxis: opts.slide,
      crossAxis: opts.overlap,
      padding: opts.overflowPadding,
      limiter: limitShift()
    };
  });
}
function getSizeMiddleware(opts) {
  if (opts.sizeMiddleware === false && !opts.sameWidth && !opts.fitViewport) return;
  let lastReferenceWidth;
  let lastReferenceHeight;
  let lastAvailableWidth;
  let lastAvailableHeight;
  return size(() => {
    const boundary = resolveBoundaryOption(opts.boundary);
    return {
      padding: opts.overflowPadding,
      ...boundary ? { boundary } : void 0,
      apply({ elements, rects, availableHeight, availableWidth }) {
        const floating = elements.floating;
        const referenceWidth = Math.round(rects.reference.width);
        const referenceHeight = Math.round(rects.reference.height);
        availableWidth = Math.floor(availableWidth);
        availableHeight = Math.floor(availableHeight);
        if (!isApproximatelyEqual(lastReferenceWidth, referenceWidth)) {
          floating.style.setProperty("--reference-width", `${referenceWidth}px`);
          lastReferenceWidth = referenceWidth;
        }
        if (!isApproximatelyEqual(lastReferenceHeight, referenceHeight)) {
          floating.style.setProperty("--reference-height", `${referenceHeight}px`);
          lastReferenceHeight = referenceHeight;
        }
        if (!isApproximatelyEqual(lastAvailableWidth, availableWidth)) {
          floating.style.setProperty("--available-width", `${availableWidth}px`);
          lastAvailableWidth = availableWidth;
        }
        if (!isApproximatelyEqual(lastAvailableHeight, availableHeight)) {
          floating.style.setProperty("--available-height", `${availableHeight}px`);
          lastAvailableHeight = availableHeight;
        }
      }
    };
  });
}
function hideWhenDetachedMiddleware(opts) {
  if (!opts.hideWhenDetached) return;
  return hide(() => ({
    strategy: "referenceHidden",
    boundary: resolveBoundaryOption(opts.boundary) ?? "clippingAncestors"
  }));
}
function getAutoUpdateOptions(opts) {
  if (!opts) return {};
  if (opts === true) {
    return { ancestorResize: true, ancestorScroll: true, elementResize: true, layoutShift: true };
  }
  return opts;
}
var floatingStyleProps = [
  "transform",
  "visibility",
  "pointer-events",
  "--x",
  "--y",
  "--z-index",
  "--reference-width",
  "--reference-height",
  "--available-width",
  "--available-height",
  "--transform-origin"
];
var arrowStyleProps = ["top", "right", "bottom", "left"];
function createStyleCleanup(el, props) {
  if (!el) return noop;
  const prev = new Map(props.map((prop) => [prop, el.style.getPropertyValue(prop)]));
  return () => {
    prev.forEach((value, prop) => {
      if (value) el.style.setProperty(prop, value);
      else el.style.removeProperty(prop);
    });
    if (el.style.length === 0) {
      el.removeAttribute("style");
    }
  };
}
function anchorIdentity(anchor) {
  if (anchor == null) return null;
  if (isHTMLElement(anchor)) return anchor;
  if (typeof anchor === "object" && anchor && "contextElement" in anchor && anchor.contextElement) {
    return anchor.contextElement;
  }
  return anchor;
}
function getPlacementImpl(referenceOrVirtual, floatingOrVirtual, opts = {}) {
  const resolveFloating = () => {
    const raw = typeof floatingOrVirtual === "function" ? floatingOrVirtual() : floatingOrVirtual;
    return raw ?? null;
  };
  const resolveAnchor = () => {
    const raw = typeof referenceOrVirtual === "function" ? referenceOrVirtual() : referenceOrVirtual;
    return opts.getAnchorElement?.() ?? raw;
  };
  const resolveReference = () => {
    const anchor = resolveAnchor();
    if (!anchor && !opts.getAnchorRect) return null;
    return getAnchorElement(anchor, opts.getAnchorRect);
  };
  const options = Object.assign({}, defaultOptions, opts);
  let middleware = [];
  let cachedMiddlewareFloating = null;
  let restoreFloatingStyles;
  let restoreArrowStyles;
  function rebuildMiddlewareForFloating(floating) {
    restoreFloatingStyles?.();
    restoreArrowStyles?.();
    cachedMiddlewareFloating = floating;
    restoreFloatingStyles = options.restoreStyles ? createStyleCleanup(floating, floatingStyleProps) : void 0;
    const arrowEl = floating.querySelector("[data-part=arrow]");
    restoreArrowStyles = options.restoreStyles ? createStyleCleanup(arrowEl, arrowStyleProps) : void 0;
    middleware = [
      getOffsetMiddleware(arrowEl, options),
      getFlipMiddleware(options),
      getShiftMiddleware(options),
      getArrowMiddleware(arrowEl, floating.ownerDocument, options),
      shiftArrowMiddleware(arrowEl),
      createTransformOriginMiddleware(
        { gutter: options.gutter, offset: options.offset, overlap: options.overlap },
        arrowEl
      ),
      getSizeMiddleware(options),
      hideWhenDetachedMiddleware(options),
      rectMiddleware
    ];
  }
  const { placement, strategy, onComplete, onPositioned } = options;
  let lastX;
  let lastY;
  let zIndexComputed = false;
  let lastAnchorForObserve = void 0;
  let lastFloatingForObserve = void 0;
  let cancelAutoUpdate = noop;
  const autoUpdateOptions = getAutoUpdateOptions(options.listeners);
  function syncAutoUpdateObservers() {
    if (!options.listeners) return;
    const anchor = resolveAnchor();
    const reference = resolveReference();
    const floating = resolveFloating();
    if (!reference || !floating) return;
    const anchorChanged = anchorIdentity(anchor) !== anchorIdentity(lastAnchorForObserve);
    const floatingChanged = floating !== lastFloatingForObserve;
    if (anchorChanged || floatingChanged) {
      cancelAutoUpdate();
      lastAnchorForObserve = anchor;
      lastFloatingForObserve = floating;
      cancelAutoUpdate = autoUpdate(reference, floating, runUpdate, autoUpdateOptions);
    }
  }
  async function updatePosition() {
    syncAutoUpdateObservers();
    const floating = resolveFloating();
    if (!floating) return;
    if (floating !== cachedMiddlewareFloating) {
      rebuildMiddlewareForFloating(floating);
      zIndexComputed = false;
    }
    const reference = resolveReference();
    if (!reference) return;
    const pos = await computePosition(reference, floating, {
      placement,
      middleware,
      strategy
    });
    const win = getWindow(floating);
    const x = roundByDpr(win, pos.x);
    const y = roundByDpr(win, pos.y);
    onComplete?.({ ...pos, x, y });
    if (options.applyStyles === false) return;
    if (!isApproximatelyEqual(lastX, x)) {
      floating.style.setProperty("--x", `${x}px`);
      lastX = x;
    }
    if (!isApproximatelyEqual(lastY, y)) {
      floating.style.setProperty("--y", `${y}px`);
      lastY = y;
    }
    if (options.hideWhenDetached) {
      const isHidden = pos.middlewareData.hide?.referenceHidden;
      if (isHidden) {
        floating.style.setProperty("visibility", "hidden");
        floating.style.setProperty("pointer-events", "none");
      } else {
        floating.style.removeProperty("visibility");
        floating.style.removeProperty("pointer-events");
      }
    }
    if (!zIndexComputed) {
      const contentEl = floating.firstElementChild;
      if (contentEl) {
        floating.style.setProperty("--z-index", getComputedStyle(contentEl).zIndex);
        zIndexComputed = true;
      }
    }
  }
  async function runUpdate() {
    if (opts.updatePosition) {
      await opts.updatePosition({ updatePosition, floatingElement: resolveFloating() });
      onPositioned?.({ placed: true });
    } else {
      await updatePosition();
    }
  }
  runUpdate();
  return () => {
    cancelAutoUpdate();
    restoreArrowStyles?.();
    restoreFloatingStyles?.();
    onPositioned?.({ placed: false });
  };
}
function getPlacement(referenceOrFn, floatingOrFn, opts = {}) {
  const { defer, ...options } = opts;
  const func = defer ? raf : (v) => v();
  const cleanups = [];
  cleanups.push(
    func(() => {
      cleanups.push(getPlacementImpl(referenceOrFn, floatingOrFn, options));
    })
  );
  return () => {
    cleanups.forEach((fn) => fn?.());
  };
}
export {
  getPlacement
};
