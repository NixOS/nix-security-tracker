// src/signature-pad.dom.ts
import { getDataUrl as dataUrl, query } from "@zag-js/dom-query";
var getRootId = (ctx) => ctx.ids?.root ?? `signature-${ctx.id}`;
var getControlId = (ctx) => ctx.ids?.control ?? `signature-control-${ctx.id}`;
var getLabelId = (ctx) => ctx.ids?.label ?? `signature-label-${ctx.id}`;
var getHiddenInputId = (ctx) => ctx.ids?.hiddenInput ?? `signature-input-${ctx.id}`;
var getControlEl = (ctx) => ctx.getById(getControlId(ctx));
var getSegmentEl = (ctx) => query(getControlEl(ctx), "[data-part=segment]");
var getHiddenInputEl = (ctx) => ctx.getById(getHiddenInputId(ctx));
var getDataUrl = (ctx, options) => {
  return dataUrl(getSegmentEl(ctx), options);
};
export {
  getControlEl,
  getControlId,
  getDataUrl,
  getHiddenInputEl,
  getHiddenInputId,
  getLabelId,
  getRootId,
  getSegmentEl
};
