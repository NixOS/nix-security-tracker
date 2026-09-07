// src/dialog.dom.ts
import { getByOwnerId, queryAll } from "@zag-js/dom-query";
import { isFunction } from "@zag-js/utils";
var getPositionerId = (ctx) => ctx.ids?.positioner ?? `dialog:${ctx.id}:positioner`;
var getBackdropId = (ctx) => ctx.ids?.backdrop ?? `dialog:${ctx.id}:backdrop`;
var getContentId = (ctx) => ctx.ids?.content ?? `dialog:${ctx.id}:content`;
var getTriggerId = (ctx, value) => {
  const customId = ctx.ids?.trigger;
  if (customId != null) return isFunction(customId) ? customId(value) : customId;
  return value ? `dialog:${ctx.id}:trigger:${value}` : `dialog:${ctx.id}:trigger`;
};
var getTitleId = (ctx) => ctx.ids?.title ?? `dialog:${ctx.id}:title`;
var getDescriptionId = (ctx) => ctx.ids?.description ?? `dialog:${ctx.id}:description`;
var getCloseTriggerId = (ctx) => ctx.ids?.closeTrigger ?? `dialog:${ctx.id}:close`;
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getPositionerEl = (ctx) => ctx.getById(getPositionerId(ctx));
var getBackdropEl = (ctx) => ctx.getById(getBackdropId(ctx));
var getTriggerEl = (ctx) => ctx.getById(getTriggerId(ctx));
var getTitleEl = (ctx) => ctx.getById(getTitleId(ctx));
var getDescriptionEl = (ctx) => ctx.getById(getDescriptionId(ctx));
var getCloseTriggerEl = (ctx) => ctx.getById(getCloseTriggerId(ctx));
var getTriggerEls = (ctx) => queryAll(ctx.getRootNode(), `[data-scope="dialog"][data-part="trigger"]${getByOwnerId(ctx.id)}`);
var getActiveTriggerEl = (ctx, value) => {
  if (value == null) {
    return getTriggerEl(ctx) ?? getTriggerEls(ctx)[0];
  }
  return ctx.getById(getTriggerId(ctx, value));
};
export {
  getActiveTriggerEl,
  getBackdropEl,
  getBackdropId,
  getCloseTriggerEl,
  getCloseTriggerId,
  getContentEl,
  getContentId,
  getDescriptionEl,
  getDescriptionId,
  getPositionerEl,
  getPositionerId,
  getTitleEl,
  getTitleId,
  getTriggerEl,
  getTriggerEls,
  getTriggerId
};
