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

// src/menu.utils.ts
var menu_utils_exports = {};
__export(menu_utils_exports, {
  closeRootMenu: () => closeRootMenu,
  isWithinPolygon: () => isWithinPolygon,
  resolveItemId: () => resolveItemId,
  setParentRoutingLock: () => setParentRoutingLock,
  unlockParentAfterChildClose: () => unlockParentAfterChildClose,
  unlockParentOnSubmenuClose: () => unlockParentOnSubmenuClose
});
module.exports = __toCommonJS(menu_utils_exports);
var import_rect_utils = require("@zag-js/rect-utils");
var dom = __toESM(require("./menu.dom.js"));
function closeRootMenu(ctx) {
  let parent = ctx.parent;
  while (parent && parent.context.get("isSubmenu")) {
    parent = parent.refs.get("parent");
  }
  parent?.send({ type: "CLOSE" });
}
function isWithinPolygon(polygon, point) {
  if (!polygon) return false;
  return (0, import_rect_utils.isPointInPolygon)(polygon, point);
}
function resolveItemId(children, value, scope) {
  const hasChildren = Object.keys(children).length > 0;
  if (!value) return null;
  if (!hasChildren) {
    return dom.getItemId(scope, value);
  }
  for (const id in children) {
    const childMenu = children[id];
    const childTriggerId = dom.getTriggerId(childMenu.scope);
    if (childTriggerId === value) {
      return childTriggerId;
    }
  }
  return dom.getItemId(scope, value);
}
function setParentRoutingLock(parent, locked) {
  if (!parent) return;
  parent.refs.set("pointerRoutingLocked", locked);
  parent.context.set("pointerRoutingMode", locked ? "locked" : "interactive");
}
function isHighlightedItemSubmenuOpen(parent) {
  const highlighted = parent.context.get("highlightedValue");
  if (!highlighted) return false;
  const children = parent.refs.get("children");
  for (const id in children) {
    const child = children[id];
    if (!child.state.hasTag("open")) continue;
    if (dom.getTriggerId(child.scope) === highlighted) return true;
  }
  return false;
}
function unlockParentAfterChildClose(parent, childIsSubmenu) {
  if (!parent) return;
  if (parent.refs.get("pointerRoutingLocked")) return;
  if (childIsSubmenu && isHighlightedItemSubmenuOpen(parent)) return;
  setParentRoutingLock(parent, false);
}
function unlockParentOnSubmenuClose(parent) {
  if (!parent) return;
  if (!isHighlightedItemSubmenuOpen(parent)) {
    setParentRoutingLock(parent, false);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  closeRootMenu,
  isWithinPolygon,
  resolveItemId,
  setParentRoutingLock,
  unlockParentAfterChildClose,
  unlockParentOnSubmenuClose
});
