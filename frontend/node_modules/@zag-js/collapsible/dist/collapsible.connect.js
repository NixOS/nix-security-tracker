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

// src/collapsible.connect.ts
var collapsible_connect_exports = {};
__export(collapsible_connect_exports, {
  connect: () => connect
});
module.exports = __toCommonJS(collapsible_connect_exports);
var import_dom_query = require("@zag-js/dom-query");
var import_collapsible = require("./collapsible.anatomy.js");
var dom = __toESM(require("./collapsible.dom.js"));
var import_utils = require("@zag-js/utils");
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
        ...import_collapsible.parts.root.attrs,
        "data-state": open ? "open" : "closed",
        dir: prop("dir"),
        id: dom.getRootId(scope)
      });
    },
    getContentProps() {
      return normalize.element({
        ...import_collapsible.parts.content.attrs,
        id: dom.getContentId(scope),
        "data-collapsible": "",
        "data-state": skip ? void 0 : open ? "open" : "closed",
        "data-disabled": (0, import_dom_query.dataAttr)(disabled),
        "data-has-collapsed-size": (0, import_dom_query.dataAttr)(hasCollapsedSize),
        hidden: !visible && !hasCollapsedSize,
        dir: prop("dir"),
        style: {
          "--height": (0, import_utils.toPx)(height),
          "--width": (0, import_utils.toPx)(width),
          "--collapsed-height": (0, import_utils.toPx)(collapsedHeight),
          "--collapsed-width": (0, import_utils.toPx)(collapsedWidth),
          ...closed && hasCollapsedHeight && {
            overflow: "hidden",
            minHeight: (0, import_utils.toPx)(collapsedHeight),
            maxHeight: (0, import_utils.toPx)(collapsedHeight)
          },
          ...closed && hasCollapsedWidth && {
            overflow: "hidden",
            minWidth: (0, import_utils.toPx)(collapsedWidth),
            maxWidth: (0, import_utils.toPx)(collapsedWidth)
          }
        }
      });
    },
    getTriggerProps() {
      return normalize.element({
        ...import_collapsible.parts.trigger.attrs,
        id: dom.getTriggerId(scope),
        dir: prop("dir"),
        type: "button",
        "data-state": open ? "open" : "closed",
        "data-disabled": (0, import_dom_query.dataAttr)(disabled),
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
        ...import_collapsible.parts.indicator.attrs,
        dir: prop("dir"),
        "data-state": open ? "open" : "closed",
        "data-disabled": (0, import_dom_query.dataAttr)(disabled)
      });
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  connect
});
