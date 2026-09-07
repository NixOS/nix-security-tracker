// src/color-picker.dom.ts
import { getRelativePoint, queryAll } from "@zag-js/dom-query";
var getRootId = (ctx) => ctx.ids?.root ?? `color-picker:${ctx.id}`;
var getLabelId = (ctx) => ctx.ids?.label ?? `color-picker:${ctx.id}:label`;
var getHiddenInputId = (ctx) => ctx.ids?.hiddenInput ?? `color-picker:${ctx.id}:hidden-input`;
var getControlId = (ctx) => ctx.ids?.control ?? `color-picker:${ctx.id}:control`;
var getTriggerId = (ctx) => ctx.ids?.trigger ?? `color-picker:${ctx.id}:trigger`;
var getContentId = (ctx) => ctx.ids?.content ?? `color-picker:${ctx.id}:content`;
var getPositionerId = (ctx) => ctx.ids?.positioner ?? `color-picker:${ctx.id}:positioner`;
var getFormatSelectId = (ctx) => ctx.ids?.formatSelect ?? `color-picker:${ctx.id}:format-select`;
var getAreaId = (ctx) => ctx.ids?.area ?? `color-picker:${ctx.id}:area`;
var getAreaGradientId = (ctx) => ctx.ids?.areaGradient ?? `color-picker:${ctx.id}:area-gradient`;
var getAreaThumbId = (ctx) => ctx.ids?.areaThumb ?? `color-picker:${ctx.id}:area-thumb`;
var getChannelSliderTrackId = (ctx, channel) => ctx.ids?.channelSliderTrack?.(channel) ?? `color-picker:${ctx.id}:slider-track:${channel}`;
var getChannelSliderThumbId = (ctx, channel) => ctx.ids?.channelSliderThumb?.(channel) ?? `color-picker:${ctx.id}:slider-thumb:${channel}`;
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getAreaThumbEl = (ctx) => ctx.getById(getAreaThumbId(ctx));
var getChannelSliderThumbEl = (ctx, channel) => ctx.getById(getChannelSliderThumbId(ctx, channel));
var getChannelInputEl = (ctx, channel) => {
  const selector = `input[data-channel="${channel}"]`;
  return [
    ...queryAll(getContentEl(ctx), selector),
    ...queryAll(getControlEl(ctx), selector)
  ];
};
var getFormatSelectEl = (ctx) => ctx.getById(getFormatSelectId(ctx));
var getHiddenInputEl = (ctx) => ctx.getById(getHiddenInputId(ctx));
var getAreaEl = (ctx) => ctx.getById(getAreaId(ctx));
var getAreaValueFromPoint = (ctx, point, dir) => {
  const areaEl = getAreaEl(ctx);
  if (!areaEl) return;
  const { getPercentValue } = getRelativePoint(point, areaEl);
  return {
    x: getPercentValue({ dir, orientation: "horizontal" }),
    y: getPercentValue({ orientation: "vertical" })
  };
};
var getControlEl = (ctx) => ctx.getById(getControlId(ctx));
var getTriggerEl = (ctx) => ctx.getById(getTriggerId(ctx));
var getPositionerEl = (ctx) => ctx.getById(getPositionerId(ctx));
var getChannelSliderTrackEl = (ctx, channel) => ctx.getById(getChannelSliderTrackId(ctx, channel));
var getChannelSliderValueFromPoint = (ctx, point, channel, dir) => {
  const trackEl = getChannelSliderTrackEl(ctx, channel);
  if (!trackEl) return;
  const { getPercentValue } = getRelativePoint(point, trackEl);
  return {
    x: getPercentValue({ dir, orientation: "horizontal" }),
    y: getPercentValue({ orientation: "vertical" })
  };
};
var getChannelInputEls = (ctx) => {
  return [
    ...queryAll(getContentEl(ctx), "input[data-channel]"),
    ...queryAll(getControlEl(ctx), "input[data-channel]")
  ];
};
export {
  getAreaEl,
  getAreaGradientId,
  getAreaId,
  getAreaThumbEl,
  getAreaThumbId,
  getAreaValueFromPoint,
  getChannelInputEl,
  getChannelInputEls,
  getChannelSliderThumbEl,
  getChannelSliderThumbId,
  getChannelSliderTrackEl,
  getChannelSliderTrackId,
  getChannelSliderValueFromPoint,
  getContentEl,
  getContentId,
  getControlEl,
  getControlId,
  getFormatSelectEl,
  getFormatSelectId,
  getHiddenInputEl,
  getHiddenInputId,
  getLabelId,
  getPositionerEl,
  getPositionerId,
  getRootId,
  getTriggerEl,
  getTriggerId
};
