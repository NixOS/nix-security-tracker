// src/collapsible.dom.ts
var getRootId = (ctx) => ctx.ids?.root ?? `collapsible:${ctx.id}`;
var getContentId = (ctx) => ctx.ids?.content ?? `collapsible:${ctx.id}:content`;
var getTriggerId = (ctx) => ctx.ids?.trigger ?? `collapsible:${ctx.id}:trigger`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getTriggerEl = (ctx) => ctx.getById(getTriggerId(ctx));
export {
  getContentEl,
  getContentId,
  getRootEl,
  getRootId,
  getTriggerEl,
  getTriggerId
};
