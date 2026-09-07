// src/password-input.dom.ts
var getRootId = (ctx) => ctx.ids?.root ?? `p-input-${ctx.id}`;
var getInputId = (ctx) => ctx.ids?.input ?? `p-input-${ctx.id}-input`;
var getInputEl = (ctx) => ctx.getById(getInputId(ctx));
export {
  getInputEl,
  getInputId,
  getRootId
};
