// src/checkbox.dom.ts
var getRootId = (ctx) => ctx.ids?.root ?? `checkbox:${ctx.id}`;
var getLabelId = (ctx) => ctx.ids?.label ?? `checkbox:${ctx.id}:label`;
var getControlId = (ctx) => ctx.ids?.control ?? `checkbox:${ctx.id}:control`;
var getHiddenInputId = (ctx) => ctx.ids?.hiddenInput ?? `checkbox:${ctx.id}:input`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getHiddenInputEl = (ctx) => ctx.getById(getHiddenInputId(ctx));
export {
  getControlId,
  getHiddenInputEl,
  getHiddenInputId,
  getLabelId,
  getRootEl,
  getRootId
};
