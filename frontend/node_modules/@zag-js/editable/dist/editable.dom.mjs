// src/editable.dom.ts
var getRootId = (ctx) => ctx.ids?.root ?? `editable:${ctx.id}`;
var getAreaId = (ctx) => ctx.ids?.area ?? `editable:${ctx.id}:area`;
var getLabelId = (ctx) => ctx.ids?.label ?? `editable:${ctx.id}:label`;
var getPreviewId = (ctx) => ctx.ids?.preview ?? `editable:${ctx.id}:preview`;
var getInputId = (ctx) => ctx.ids?.input ?? `editable:${ctx.id}:input`;
var getControlId = (ctx) => ctx.ids?.control ?? `editable:${ctx.id}:control`;
var getSubmitTriggerId = (ctx) => ctx.ids?.submitTrigger ?? `editable:${ctx.id}:submit`;
var getCancelTriggerId = (ctx) => ctx.ids?.cancelTrigger ?? `editable:${ctx.id}:cancel`;
var getEditTriggerId = (ctx) => ctx.ids?.editTrigger ?? `editable:${ctx.id}:edit`;
var getInputEl = (ctx) => ctx.getById(getInputId(ctx));
var getPreviewEl = (ctx) => ctx.getById(getPreviewId(ctx));
var getSubmitTriggerEl = (ctx) => ctx.getById(getSubmitTriggerId(ctx));
var getCancelTriggerEl = (ctx) => ctx.getById(getCancelTriggerId(ctx));
var getEditTriggerEl = (ctx) => ctx.getById(getEditTriggerId(ctx));
export {
  getAreaId,
  getCancelTriggerEl,
  getCancelTriggerId,
  getControlId,
  getEditTriggerEl,
  getEditTriggerId,
  getInputEl,
  getInputId,
  getLabelId,
  getPreviewEl,
  getPreviewId,
  getRootId,
  getSubmitTriggerEl,
  getSubmitTriggerId
};
