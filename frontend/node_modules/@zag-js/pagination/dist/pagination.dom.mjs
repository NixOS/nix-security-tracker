// src/pagination.dom.ts
var getRootId = (ctx) => ctx.ids?.root ?? `pagination:${ctx.id}`;
var getFirstTriggerId = (ctx) => ctx.ids?.firstTrigger ?? `pagination:${ctx.id}:first`;
var getPrevTriggerId = (ctx) => ctx.ids?.prevTrigger ?? `pagination:${ctx.id}:prev`;
var getNextTriggerId = (ctx) => ctx.ids?.nextTrigger ?? `pagination:${ctx.id}:next`;
var getLastTriggerId = (ctx) => ctx.ids?.lastTrigger ?? `pagination:${ctx.id}:last`;
var getEllipsisId = (ctx, index) => ctx.ids?.ellipsis?.(index) ?? `pagination:${ctx.id}:ellipsis:${index}`;
var getItemId = (ctx, page) => ctx.ids?.item?.(page) ?? `pagination:${ctx.id}:item:${page}`;
export {
  getEllipsisId,
  getFirstTriggerId,
  getItemId,
  getLastTriggerId,
  getNextTriggerId,
  getPrevTriggerId,
  getRootId
};
