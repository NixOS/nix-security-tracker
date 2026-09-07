// src/cascade-select.dom.ts
import { createScope, dispatchInputValueEvent, queryAll } from "@zag-js/dom-query";
var dom = createScope({
  getRootId: (ctx) => ctx.ids?.root ?? `cascade-select:${ctx.id}`,
  getLabelId: (ctx) => ctx.ids?.label ?? `cascade-select:${ctx.id}:label`,
  getControlId: (ctx) => ctx.ids?.control ?? `cascade-select:${ctx.id}:control`,
  getTriggerId: (ctx) => ctx.ids?.trigger ?? `cascade-select:${ctx.id}:trigger`,
  getIndicatorId: (ctx) => ctx.ids?.indicator ?? `cascade-select:${ctx.id}:indicator`,
  getClearTriggerId: (ctx) => ctx.ids?.clearTrigger ?? `cascade-select:${ctx.id}:clear-trigger`,
  getPositionerId: (ctx) => ctx.ids?.positioner ?? `cascade-select:${ctx.id}:positioner`,
  getContentId: (ctx) => ctx.ids?.content ?? `cascade-select:${ctx.id}:content`,
  getHiddenInputId: (ctx) => ctx.ids?.hiddenInput ?? `cascade-select:${ctx.id}:hidden-input`,
  getListId: (ctx, value) => ctx.ids?.list?.(value) ?? `cascade-select:${ctx.id}:list:${value}`,
  getItemId: (ctx, value) => ctx.ids?.item?.(value) ?? `cascade-select:${ctx.id}:item:${value}`,
  getRootEl: (ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getLabelEl: (ctx) => dom.getById(ctx, dom.getLabelId(ctx)),
  getControlEl: (ctx) => dom.getById(ctx, dom.getControlId(ctx)),
  getTriggerEl: (ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getIndicatorEl: (ctx) => dom.getById(ctx, dom.getIndicatorId(ctx)),
  getClearTriggerEl: (ctx) => dom.getById(ctx, dom.getClearTriggerId(ctx)),
  getPositionerEl: (ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getContentEl: (ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getHiddenInputEl: (ctx) => dom.getById(ctx, dom.getHiddenInputId(ctx)),
  getListEl: (ctx, value) => dom.getById(ctx, dom.getListId(ctx, value)),
  getListEls: (ctx) => queryAll(dom.getContentEl(ctx), `[data-part="list"]`),
  getItemEl: (ctx, value) => dom.getById(ctx, dom.getItemId(ctx, value)),
  dispatchInputEvent: (ctx, value) => {
    const inputEl = dom.getHiddenInputEl(ctx);
    if (!inputEl) return;
    dispatchInputValueEvent(inputEl, { value });
  }
});
export {
  dom
};
