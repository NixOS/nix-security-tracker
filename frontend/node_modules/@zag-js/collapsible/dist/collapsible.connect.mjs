// src/collapsible.connect.ts
import { dataAttr } from "@zag-js/dom-query";
import { parts } from "./collapsible.anatomy.mjs";
import * as dom from "./collapsible.dom.mjs";
import { toPx } from "@zag-js/utils";
function connect(service, normalize) {
  const { state, send, context, scope, prop } = service;
  const visible = state.matches("open") || state.matches("closing");
  const open = state.matches("open");
  const closed = state.matches("closed");
  const { width, height } = context.get("size");
  const disabled = !!prop("disabled");
  const collapsedHeight = prop("collapsedHeight");
  const collapsedWidth = prop("collapsedWidth");
  const hasCollapsedHeight = collapsedHeight != null;
  const hasCollapsedWidth = collapsedWidth != null;
  const hasCollapsedSize = hasCollapsedHeight || hasCollapsedWidth;
  const skip = !context.get("initial") && open;
  return {
    disabled,
    visible,
    open,
    measureSize() {
      send({ type: "size.measure" });
    },
    setOpen(nextOpen) {
      const open2 = state.matches("open");
      if (open2 === nextOpen) return;
      send({ type: nextOpen ? "open" : "close" });
    },
    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        "data-state": open ? "open" : "closed",
        dir: prop("dir"),
        id: dom.getRootId(scope)
      });
    },
    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        id: dom.getContentId(scope),
        "data-collapsible": "",
        "data-state": skip ? void 0 : open ? "open" : "closed",
        "data-disabled": dataAttr(disabled),
        "data-has-collapsed-size": dataAttr(hasCollapsedSize),
        hidden: !visible && !hasCollapsedSize,
        dir: prop("dir"),
        style: {
          "--height": toPx(height),
          "--width": toPx(width),
          "--collapsed-height": toPx(collapsedHeight),
          "--collapsed-width": toPx(collapsedWidth),
          ...closed && hasCollapsedHeight && {
            overflow: "hidden",
            minHeight: toPx(collapsedHeight),
            maxHeight: toPx(collapsedHeight)
          },
          ...closed && hasCollapsedWidth && {
            overflow: "hidden",
            minWidth: toPx(collapsedWidth),
            maxWidth: toPx(collapsedWidth)
          }
        }
      });
    },
    getTriggerProps() {
      return normalize.element({
        ...parts.trigger.attrs,
        id: dom.getTriggerId(scope),
        dir: prop("dir"),
        type: "button",
        "data-state": open ? "open" : "closed",
        "data-disabled": dataAttr(disabled),
        "aria-controls": dom.getContentId(scope),
        "aria-expanded": visible || false,
        onClick(event) {
          if (event.defaultPrevented) return;
          if (disabled) return;
          send({ type: open ? "close" : "open" });
        }
      });
    },
    getIndicatorProps() {
      return normalize.element({
        ...parts.indicator.attrs,
        dir: prop("dir"),
        "data-state": open ? "open" : "closed",
        "data-disabled": dataAttr(disabled)
      });
    }
  };
}
export {
  connect
};
