// src/rating-group.dom.ts
import { dispatchInputValueEvent, query } from "@zag-js/dom-query";
var getRootId = (ctx) => ctx.ids?.root ?? `rating:${ctx.id}`;
var getLabelId = (ctx) => ctx.ids?.label ?? `rating:${ctx.id}:label`;
var getHiddenInputId = (ctx) => ctx.ids?.hiddenInput ?? `rating:${ctx.id}:input`;
var getControlId = (ctx) => ctx.ids?.control ?? `rating:${ctx.id}:control`;
var getItemId = (ctx, id) => ctx.ids?.item?.(id) ?? `rating:${ctx.id}:item:${id}`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getControlEl = (ctx) => ctx.getById(getControlId(ctx));
var getRadioEl = (ctx, value) => {
  const selector = `[role=radio][aria-posinset='${Math.ceil(value)}']`;
  return query(getControlEl(ctx), selector);
};
var getHiddenInputEl = (ctx) => ctx.getById(getHiddenInputId(ctx));
var dispatchChangeEvent = (ctx, value) => {
  const inputEl = getHiddenInputEl(ctx);
  if (!inputEl) return;
  dispatchInputValueEvent(inputEl, { value });
};
export {
  dispatchChangeEvent,
  getControlEl,
  getControlId,
  getHiddenInputEl,
  getHiddenInputId,
  getItemId,
  getLabelId,
  getRadioEl,
  getRootEl,
  getRootId
};
