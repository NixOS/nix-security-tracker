// src/carousel.dom.ts
import { getTabbables, queryAll } from "@zag-js/dom-query";
var getRootId = (ctx) => ctx.ids?.root ?? `carousel:${ctx.id}`;
var getItemId = (ctx, index) => ctx.ids?.item?.(index) ?? `carousel:${ctx.id}:item:${index}`;
var getItemGroupId = (ctx) => ctx.ids?.itemGroup ?? `carousel:${ctx.id}:item-group`;
var getNextTriggerId = (ctx) => ctx.ids?.nextTrigger ?? `carousel:${ctx.id}:next-trigger`;
var getPrevTriggerId = (ctx) => ctx.ids?.prevTrigger ?? `carousel:${ctx.id}:prev-trigger`;
var getIndicatorGroupId = (ctx) => ctx.ids?.indicatorGroup ?? `carousel:${ctx.id}:indicator-group`;
var getIndicatorId = (ctx, index) => ctx.ids?.indicator?.(index) ?? `carousel:${ctx.id}:indicator:${index}`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getItemGroupEl = (ctx) => ctx.getById(getItemGroupId(ctx));
var getItemEl = (ctx, index) => ctx.getById(getItemId(ctx, index));
var getItemEls = (ctx) => queryAll(getItemGroupEl(ctx), `[data-part=item]`);
var getIndicatorEl = (ctx, page) => ctx.getById(getIndicatorId(ctx, page));
var syncTabIndex = (ctx) => {
  const el = getItemGroupEl(ctx);
  if (!el) return;
  const tabbables = getTabbables(el);
  el.setAttribute("tabindex", tabbables.length > 0 ? "-1" : "0");
};
export {
  getIndicatorEl,
  getIndicatorGroupId,
  getIndicatorId,
  getItemEl,
  getItemEls,
  getItemGroupEl,
  getItemGroupId,
  getItemId,
  getNextTriggerId,
  getPrevTriggerId,
  getRootEl,
  getRootId,
  syncTabIndex
};
