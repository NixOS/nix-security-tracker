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

// src/get-placement.ts
var get_placement_exports = {};
__export(get_placement_exports, {
  getPlacement: () => getPlacement
});
module.exports = __toCommonJS(get_placement_exports);
var import_dom = require("@floating-ui/dom");
var import_dom_query = require("@zag-js/dom-query");
var import_utils = require("@zag-js/utils");
var import_get_anchor = require("./get-anchor.js");
var import_middleware = require("./middleware.js");
var import_placement = require("./placement.js");
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
  return (0, import_dom.arrow)({ element, padding: opts.arrowPadding });
}
function getOffsetMiddleware(arrowElement, opts) {
  if ((0, import_utils.isNull)(opts.offset ?? opts.gutter)) return;
  return (0, import_dom.offset)(({ placement }) => {
    const arrowOffset = (arrowElement?.clientHeight || 0) / 2;
    const gutter = opts.offset?.mainAxis ?? opts.gutter;
    const mainAxis = typeof gutter === "number" ? gutter + arrowOffset : gutter ?? arrowOffset;
    const { hasAlign } = (0, import_placement.getPlacementDetails)(placement);
    const shift2 = !hasAlign ? opts.shift : void 0;
    const crossAxis = opts.offset?.crossAxis ?? shift2;
    return (0, import_utils.compact)({
      crossAxis,
      mainAxis,
      alignmentAxis: opts.shift
    });
  });
}
function getFlipMiddleware(opts) {
  if (!opts.flip) return;
  return (0, import_dom.flip)(() => {
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
  return (0, import_dom.shift)(() => {
    const boundary = resolveBoundaryOption(opts.boundary);
    return {
      ...boundary ? { boundary } : void 0,
      mainAxis: opts.slide,
      crossAxis: opts.overlap,
      padding: opts.overflowPadding,
      limiter: (0, import_dom.limitShift)()
    };
  });
}
function getSizeMiddleware(opts) {
  if (opts.sizeMiddleware === false && !opts.sameWidth && !opts.fitViewport) return;
  let lastReferenceWidth;
  let lastReferenceHeight;
  let lastAvailableWidth;
  let lastAvailableHeight;
  return (0, import_dom.size)(() => {
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
  return (0, import_dom.hide)(() => ({
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
  if (!el) return import_utils.noop;
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
  if ((0, import_dom_query.isHTMLElement)(anchor)) return anchor;
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
    return (0, import_get_anchor.getAnchorElement)(anchor, opts.getAnchorRect);
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
      (0, import_middleware.shiftArrowMiddleware)(arrowEl),
      (0, import_middleware.createTransformOriginMiddleware)(
        { gutter: options.gutter, offset: options.offset, overlap: options.overlap },
        arrowEl
      ),
      getSizeMiddleware(options),
      hideWhenDetachedMiddleware(options),
      import_middleware.rectMiddleware
    ];
  }
  const { placement, strategy, onComplete, onPositioned } = options;
  let lastX;
  let lastY;
  let zIndexComputed = false;
  let lastAnchorForObserve = void 0;
  let lastFloatingForObserve = void 0;
  let cancelAutoUpdate = import_utils.noop;
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
      cancelAutoUpdate = (0, import_dom.autoUpdate)(reference, floating, runUpdate, autoUpdateOptions);
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
    const pos = await (0, import_dom.computePosition)(reference, floating, {
      placement,
      middleware,
      strategy
    });
    const win = (0, import_dom_query.getWindow)(floating);
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
        floating.style.setProperty("--z-index", (0, import_dom_query.getComputedStyle)(contentEl).zIndex);
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
  const func = defer ? import_dom_query.raf : (v) => v();
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getPlacement
});
