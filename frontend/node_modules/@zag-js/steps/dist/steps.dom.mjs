// src/steps.dom.ts
var getRootId = (ctx) => ctx.ids?.root ?? `steps:${ctx.id}`;
var getListId = (ctx) => ctx.ids?.list ?? `steps:${ctx.id}:list`;
var getTriggerId = (ctx, index) => ctx.ids?.triggerId?.(index) ?? `steps:${ctx.id}:trigger:${index}`;
var getContentId = (ctx, index) => ctx.ids?.contentId?.(index) ?? `steps:${ctx.id}:content:${index}`;
export {
  getContentId,
  getListId,
  getRootId,
  getTriggerId
};
