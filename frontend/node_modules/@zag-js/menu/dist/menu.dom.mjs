// src/menu.dom.ts
import {
  contains,
  getByOwnerId,
  getByTypeahead,
  getWindow,
  isHTMLElement,
  queryAll
} from "@zag-js/dom-query";
import { first, isFunction, last, next, prev } from "@zag-js/utils";
var getTriggerId = (ctx, value) => {
  const customId = ctx.ids?.trigger;
  if (customId != null) return isFunction(customId) ? customId(value) : customId;
  return value ? `menu:${ctx.id}:trigger:${value}` : `menu:${ctx.id}:trigger`;
};
var getContextTriggerId = (ctx, value) => {
  const customId = ctx.ids?.contextTrigger;
  if (customId != null) return isFunction(customId) ? customId(value) : customId;
  return value ? `menu:${ctx.id}:ctx-trigger:${value}` : `menu:${ctx.id}:ctx-trigger`;
};
var getContentId = (ctx) => ctx.ids?.content ?? `menu:${ctx.id}:content`;
var getArrowId = (ctx) => ctx.ids?.arrow ?? `menu:${ctx.id}:arrow`;
var getPositionerId = (ctx) => ctx.ids?.positioner ?? `menu:${ctx.id}:popper`;
var getGroupId = (ctx, id) => ctx.ids?.group?.(id) ?? `menu:${ctx.id}:group:${id}`;
var getItemId = (ctx, id) => `${ctx.id}/${id}`;
var getItemValue = (el) => el?.dataset.value ?? null;
var getGroupLabelId = (ctx, id) => ctx.ids?.groupLabel?.(id) ?? `menu:${ctx.id}:group-label:${id}`;
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getPositionerEl = (ctx) => ctx.getById(getPositionerId(ctx));
var getTriggerEl = (ctx) => ctx.getById(getTriggerId(ctx));
var getItemEl = (ctx, value) => value ? ctx.getById(getItemId(ctx, value)) : null;
var getArrowEl = (ctx) => ctx.getById(getArrowId(ctx));
var getContextTriggerEl = (ctx) => ctx.getById(getContextTriggerId(ctx));
var getTriggerEls = (ctx) => queryAll(ctx.getRootNode(), `[data-scope="menu"][data-part="trigger"]${getByOwnerId(ctx.id)}`);
var getContextTriggerEls = (ctx) => queryAll(ctx.getRootNode(), `[data-scope="menu"][data-part="context-trigger"]${getByOwnerId(ctx.id)}`);
var getActiveTriggerEl = (ctx, value) => {
  if (value == null) {
    return getTriggerEl(ctx) ?? getTriggerEls(ctx)[0];
  }
  return ctx.getById(getTriggerId(ctx, value));
};
var getElements = (ctx) => {
  const selector = `[role^="menuitem"]${getByOwnerId(getContentId(ctx))}:not([data-disabled])`;
  return queryAll(getContentEl(ctx), selector);
};
var getFirstEl = (ctx) => first(getElements(ctx));
var getLastEl = (ctx) => last(getElements(ctx));
var isMatch = (el, value) => {
  if (!value) return false;
  return el.id === value || el.dataset.value === value;
};
var getNextEl = (ctx, opts) => {
  const items = getElements(ctx);
  const index = items.findIndex((el) => isMatch(el, opts.value));
  return next(items, index, { loop: opts.loop ?? opts.loopFocus });
};
var getPrevEl = (ctx, opts) => {
  const items = getElements(ctx);
  const index = items.findIndex((el) => isMatch(el, opts.value));
  return prev(items, index, { loop: opts.loop ?? opts.loopFocus });
};
var getElemByKey = (ctx, opts) => {
  const items = getElements(ctx);
  const item = items.find((el) => isMatch(el, opts.value));
  return getByTypeahead(items, { state: opts.typeaheadState, key: opts.key, activeId: item?.id ?? null });
};
var isTargetDisabled = (v) => {
  return isHTMLElement(v) && (v.dataset.disabled === "" || v.hasAttribute("disabled"));
};
var isTriggerItem = (el) => {
  return !!el?.getAttribute("role")?.startsWith("menuitem") && !!el?.hasAttribute("data-controls");
};
var getOptionFromItemEl = (el) => {
  return {
    id: el.id,
    name: el.dataset.name,
    value: el.dataset.value,
    valueText: el.dataset.valueText,
    type: el.dataset.type
  };
};
var itemSelectEvent = "menu:select";
function dispatchSelectionEvent(el, value) {
  if (!el) return;
  const win = getWindow(el);
  const event = new win.CustomEvent(itemSelectEvent, { detail: { value } });
  el.dispatchEvent(event);
}
function getPortaledContentEl(scope) {
  const contentId = getContentId(scope);
  return getContentEl(scope) ?? scope.getDoc().getElementById(contentId);
}
function isTargetWithinMenuTree(target, children) {
  if (!isHTMLElement(target)) return false;
  for (const id in children) {
    const child = children[id];
    const childContent = getPortaledContentEl(child.scope);
    if (childContent && contains(childContent, target)) return true;
    const nested = child.refs.get("children");
    if (Object.keys(nested).length > 0 && isTargetWithinMenuTree(target, nested)) return true;
  }
  return false;
}
export {
  dispatchSelectionEvent,
  getActiveTriggerEl,
  getArrowEl,
  getArrowId,
  getContentEl,
  getContentId,
  getContextTriggerEl,
  getContextTriggerEls,
  getContextTriggerId,
  getElemByKey,
  getElements,
  getFirstEl,
  getGroupId,
  getGroupLabelId,
  getItemEl,
  getItemId,
  getItemValue,
  getLastEl,
  getNextEl,
  getOptionFromItemEl,
  getPositionerEl,
  getPositionerId,
  getPrevEl,
  getTriggerEl,
  getTriggerEls,
  getTriggerId,
  isTargetDisabled,
  isTargetWithinMenuTree,
  isTriggerItem,
  itemSelectEvent
};
