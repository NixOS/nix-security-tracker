// src/toast.dom.ts
var getRegionId = (placement) => `toast-group:${placement}`;
var getRegionEl = (ctx, placement) => ctx.getById(`toast-group:${placement}`);
var getRootId = (ctx) => `toast:${ctx.id}`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getTitleId = (ctx) => `toast:${ctx.id}:title`;
var getDescriptionId = (ctx) => `toast:${ctx.id}:description`;
var getCloseTriggerId = (ctx) => `toast${ctx.id}:close`;
export {
  getCloseTriggerId,
  getDescriptionId,
  getRegionEl,
  getRegionId,
  getRootEl,
  getRootId,
  getTitleId
};
