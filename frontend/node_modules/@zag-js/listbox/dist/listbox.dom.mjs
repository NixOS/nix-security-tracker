// src/listbox.dom.ts
var getRootId = (ctx) => ctx.ids?.root ?? `listbox:${ctx.id}`;
var getContentId = (ctx) => ctx.ids?.content ?? `listbox:${ctx.id}:content`;
var getLabelId = (ctx) => ctx.ids?.label ?? `listbox:${ctx.id}:label`;
var getItemId = (ctx, id) => ctx.ids?.item?.(id) ?? `listbox:${ctx.id}:item:${id}`;
var getItemGroupId = (ctx, id) => ctx.ids?.itemGroup?.(id) ?? `listbox:${ctx.id}:item-group:${id}`;
var getItemGroupLabelId = (ctx, id) => ctx.ids?.itemGroupLabel?.(id) ?? `listbox:${ctx.id}:item-group-label:${id}`;
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getItemEl = (ctx, id) => ctx.getById(getItemId(ctx, id));
export {
  getContentEl,
  getContentId,
  getItemEl,
  getItemGroupId,
  getItemGroupLabelId,
  getItemId,
  getLabelId,
  getRootId
};
