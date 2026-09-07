// src/timer.dom.ts
var getRootId = (ctx) => ctx.ids?.root ?? `timer:${ctx.id}:root`;
var getAreaId = (ctx) => ctx.ids?.area ?? `timer:${ctx.id}:area`;
var getAreaEl = (ctx) => ctx.getById(getAreaId(ctx));
export {
  getAreaEl,
  getAreaId,
  getRootId
};
