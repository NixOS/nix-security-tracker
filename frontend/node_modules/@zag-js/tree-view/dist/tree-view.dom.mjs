// src/tree-view.dom.ts
var getRootId = (ctx) => ctx.ids?.root ?? `tree:${ctx.id}:root`;
var getLabelId = (ctx) => ctx.ids?.label ?? `tree:${ctx.id}:label`;
var getNodeId = (ctx, value) => ctx.ids?.node?.(value) ?? `tree:${ctx.id}:node:${value}`;
var getTreeId = (ctx) => ctx.ids?.tree ?? `tree:${ctx.id}:tree`;
var getTreeEl = (ctx) => ctx.getById(getTreeId(ctx));
var focusNode = (ctx, value) => {
  if (value == null) return;
  ctx.getById(getNodeId(ctx, value))?.focus();
};
var getRenameInputId = (ctx, value) => `tree:${ctx.id}:rename-input:${value}`;
var getRenameInputEl = (ctx, value) => {
  return ctx.getById(getRenameInputId(ctx, value));
};
export {
  focusNode,
  getLabelId,
  getNodeId,
  getRenameInputEl,
  getRenameInputId,
  getRootId,
  getTreeEl,
  getTreeId
};
