// src/menu.utils.ts
import { isPointInPolygon } from "@zag-js/rect-utils";
import * as dom from "./menu.dom.mjs";
function closeRootMenu(ctx) {
  let parent = ctx.parent;
  while (parent && parent.context.get("isSubmenu")) {
    parent = parent.refs.get("parent");
  }
  parent?.send({ type: "CLOSE" });
}
function isWithinPolygon(polygon, point) {
  if (!polygon) return false;
  return isPointInPolygon(polygon, point);
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
export {
  closeRootMenu,
  isWithinPolygon,
  resolveItemId,
  setParentRoutingLock,
  unlockParentAfterChildClose,
  unlockParentOnSubmenuClose
};
