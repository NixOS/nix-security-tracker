// src/angle-slider.dom.ts
var getRootId = (ctx) => ctx.ids?.root ?? `angle-slider:${ctx.id}`;
var getThumbId = (ctx) => ctx.ids?.thumb ?? `angle-slider:${ctx.id}:thumb`;
var getHiddenInputId = (ctx) => ctx.ids?.hiddenInput ?? `angle-slider:${ctx.id}:input`;
var getControlId = (ctx) => ctx.ids?.control ?? `angle-slider:${ctx.id}:control`;
var getValueTextId = (ctx) => ctx.ids?.valueText ?? `angle-slider:${ctx.id}:value-text`;
var getLabelId = (ctx) => ctx.ids?.label ?? `angle-slider:${ctx.id}:label`;
var getHiddenInputEl = (ctx) => ctx.getById(getHiddenInputId(ctx));
var getControlEl = (ctx) => ctx.getById(getControlId(ctx));
var getThumbEl = (ctx) => ctx.getById(getThumbId(ctx));
export {
  getControlEl,
  getControlId,
  getHiddenInputEl,
  getHiddenInputId,
  getLabelId,
  getRootId,
  getThumbEl,
  getThumbId,
  getValueTextId
};
