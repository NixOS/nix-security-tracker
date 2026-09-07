"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/scroll-area.connect.ts
var scroll_area_connect_exports = {};
__export(scroll_area_connect_exports, {
  connect: () => connect
});
module.exports = __toCommonJS(scroll_area_connect_exports);
var import_dom_query = require("@zag-js/dom-query");
var import_utils = require("@zag-js/utils");
var import_scroll_area = require("./scroll-area.anatomy.js");
var dom = __toESM(require("./scroll-area.dom.js"));
var import_scroll_progress = require("./utils/scroll-progress.js");
var import_scroll_to = require("./utils/scroll-to.js");
var import_scroll_to_edge = require("./utils/scroll-to-edge.js");
function connect(service, normalize) {
  const { state, send, context, prop, scope } = service;
  const dragging = state.matches("dragging");
  const hovering = context.get("hovering");
  const cornerSize = context.get("cornerSize");
  const thumbSize = context.get("thumbSize");
  const hiddenState = context.get("hiddenState");
  const atSides = context.get("atSides");
  return {
    isAtTop: atSides.top,
    isAtBottom: atSides.bottom,
    isAtLeft: atSides.left,
    isAtRight: atSides.right,
    hasOverflowX: !hiddenState.scrollbarXHidden,
    hasOverflowY: !hiddenState.scrollbarYHidden,
    getScrollProgress() {
      return (0, import_scroll_progress.getScrollProgress)(dom.getViewportEl(scope), 0);
    },
    scrollToEdge(details) {
      const { edge, behavior } = details;
      return (0, import_scroll_to_edge.scrollToEdge)(dom.getViewportEl(scope), edge, prop("dir"), behavior);
    },
    scrollTo(details) {
      return (0, import_scroll_to.scrollTo)(dom.getViewportEl(scope), details);
    },
    getScrollbarState(props) {
      const horizontal = props.orientation === "horizontal";
      return {
        hovering,
        dragging,
        scrolling: context.get(horizontal ? "scrollingX" : "scrollingY"),
        hidden: horizontal ? hiddenState.scrollbarXHidden : hiddenState.scrollbarYHidden
      };
    },
    getRootProps() {
      return normalize.element({
        ...import_scroll_area.parts.root.attrs,
        id: dom.getRootId(scope),
        dir: prop("dir"),
        role: "presentation",
        "data-overflow-x": (0, import_dom_query.dataAttr)(!hiddenState.scrollbarXHidden),
        "data-overflow-y": (0, import_dom_query.dataAttr)(!hiddenState.scrollbarYHidden),
        onPointerEnter(event) {
          const target = (0, import_dom_query.getEventTarget)(event);
          if (!(0, import_dom_query.contains)(event.currentTarget, target)) return;
          send({ type: "root.pointerenter", pointerType: event.pointerType });
        },
        onPointerMove(event) {
          const target = (0, import_dom_query.getEventTarget)(event);
          if (!(0, import_dom_query.contains)(event.currentTarget, target)) return;
          send({ type: "root.pointerenter", pointerType: event.pointerType });
        },
        onPointerDown({ pointerType }) {
          send({ type: "root.pointerdown", pointerType });
        },
        onPointerLeave(event) {
          if ((0, import_dom_query.contains)(event.currentTarget, event.relatedTarget)) return;
          send({ type: "root.pointerleave" });
        },
        style: {
          position: "relative",
          "--corner-width": (0, import_utils.toPx)(cornerSize?.width),
          "--corner-height": (0, import_utils.toPx)(cornerSize?.height),
          "--thumb-width": (0, import_utils.toPx)(thumbSize?.width),
          "--thumb-height": (0, import_utils.toPx)(thumbSize?.height)
        }
      });
    },
    getViewportProps() {
      const handleUserInteraction = () => {
        send({ type: "user.scroll" });
      };
      return normalize.element({
        ...import_scroll_area.parts.viewport.attrs,
        role: "presentation",
        "data-ownedby": dom.getRootId(scope),
        id: dom.getViewportId(scope),
        "data-at-top": (0, import_dom_query.dataAttr)(atSides.top),
        "data-at-bottom": (0, import_dom_query.dataAttr)(atSides.bottom),
        "data-at-left": (0, import_dom_query.dataAttr)(atSides.left),
        "data-at-right": (0, import_dom_query.dataAttr)(atSides.right),
        "data-overflow-x": (0, import_dom_query.dataAttr)(!hiddenState.scrollbarXHidden),
        "data-overflow-y": (0, import_dom_query.dataAttr)(!hiddenState.scrollbarYHidden),
        tabIndex: hiddenState.scrollbarXHidden || hiddenState.scrollbarYHidden ? void 0 : 0,
        style: {
          overflow: "auto"
        },
        onScroll(event) {
          send({ type: "viewport.scroll", target: event.currentTarget });
        },
        onWheel: handleUserInteraction,
        onTouchMove: handleUserInteraction,
        onPointerMove: handleUserInteraction,
        onPointerEnter: handleUserInteraction,
        onKeyDown: handleUserInteraction
      });
    },
    getContentProps() {
      return normalize.element({
        ...import_scroll_area.parts.content.attrs,
        id: dom.getContentId(scope),
        role: "presentation",
        "data-overflow-x": (0, import_dom_query.dataAttr)(!hiddenState.scrollbarXHidden),
        "data-overflow-y": (0, import_dom_query.dataAttr)(!hiddenState.scrollbarYHidden),
        style: {
          minWidth: "fit-content"
        }
      });
    },
    getScrollbarProps(props = {}) {
      const { orientation = "vertical" } = props;
      return normalize.element({
        ...import_scroll_area.parts.scrollbar.attrs,
        "data-ownedby": dom.getRootId(scope),
        "data-orientation": orientation,
        "data-scrolling": (0, import_dom_query.dataAttr)(context.get(orientation === "horizontal" ? "scrollingX" : "scrollingY")),
        "data-hover": (0, import_dom_query.dataAttr)(hovering),
        "data-dragging": (0, import_dom_query.dataAttr)(dragging),
        "data-overflow-x": (0, import_dom_query.dataAttr)(!hiddenState.scrollbarXHidden),
        "data-overflow-y": (0, import_dom_query.dataAttr)(!hiddenState.scrollbarYHidden),
        onPointerUp() {
          send({ type: "scrollbar.pointerup", orientation });
        },
        onPointerDown(event) {
          if (event.button !== 0) {
            return;
          }
          if (event.currentTarget !== event.target) {
            return;
          }
          const point = (0, import_dom_query.getEventPoint)(event);
          send({ type: "scrollbar.pointerdown", orientation, point });
          event.stopPropagation();
        },
        style: {
          position: "absolute",
          touchAction: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
          ...orientation === "vertical" && {
            top: 0,
            bottom: `var(--corner-height)`,
            insetInlineEnd: 0
          },
          ...orientation === "horizontal" && {
            insetInlineStart: 0,
            insetInlineEnd: `var(--corner-width)`,
            bottom: 0
          }
        }
      });
    },
    getThumbProps(props = {}) {
      const { orientation = "vertical" } = props;
      return normalize.element({
        ...import_scroll_area.parts.thumb.attrs,
        "data-ownedby": dom.getRootId(scope),
        "data-orientation": orientation,
        "data-hover": (0, import_dom_query.dataAttr)(hovering),
        "data-dragging": (0, import_dom_query.dataAttr)(dragging),
        onPointerDown(event) {
          if (event.button !== 0) return;
          const point = (0, import_dom_query.getEventPoint)(event);
          send({ type: "thumb.pointerdown", orientation, point });
        },
        style: {
          ...orientation === "vertical" && {
            height: "var(--thumb-height)"
          },
          ...orientation === "horizontal" && {
            width: "var(--thumb-width)"
          }
        }
      });
    },
    getCornerProps() {
      return normalize.element({
        ...import_scroll_area.parts.corner.attrs,
        "data-ownedby": dom.getRootId(scope),
        "data-hover": (0, import_dom_query.dataAttr)(hovering),
        "data-state": hiddenState.cornerHidden ? "hidden" : "visible",
        "data-overflow-x": (0, import_dom_query.dataAttr)(!hiddenState.scrollbarXHidden),
        "data-overflow-y": (0, import_dom_query.dataAttr)(!hiddenState.scrollbarYHidden),
        style: {
          position: "absolute",
          bottom: 0,
          insetInlineEnd: 0,
          width: "var(--corner-width)",
          height: "var(--corner-height)"
        }
      });
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  connect
});
