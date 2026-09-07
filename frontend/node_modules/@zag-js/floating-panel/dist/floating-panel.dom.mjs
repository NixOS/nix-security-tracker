// src/floating-panel.dom.ts
import { isHTMLElement } from "@zag-js/dom-query";
import { createRect, getElementRect, getWindowRect } from "@zag-js/rect-utils";
import { pick } from "@zag-js/utils";
var getTriggerId = (ctx) => ctx.ids?.trigger ?? `float:${ctx.id}:trigger`;
var getPositionerId = (ctx) => ctx.ids?.positioner ?? `float:${ctx.id}:positioner`;
var getContentId = (ctx) => ctx.ids?.content ?? `float:${ctx.id}:content`;
var getTitleId = (ctx) => ctx.ids?.title ?? `float:${ctx.id}:title`;
var getHeaderId = (ctx) => ctx.ids?.header ?? `float:${ctx.id}:header`;
var getTriggerEl = (ctx) => ctx.getById(getTriggerId(ctx));
var getPositionerEl = (ctx) => ctx.getById(getPositionerId(ctx));
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getHeaderEl = (ctx) => ctx.getById(getHeaderId(ctx));
var getBoundaryRect = (ctx, boundaryEl, allowOverflow) => {
  let boundaryRect;
  if (isHTMLElement(boundaryEl)) {
    boundaryRect = getElementRect(boundaryEl);
  } else {
    boundaryRect = getWindowRect(ctx.getWin());
  }
  if (allowOverflow) {
    boundaryRect = createRect({
      x: -boundaryRect.width,
      // empty(left)
      y: boundaryRect.minY,
      width: boundaryRect.width * 3,
      // empty(left) + win + empty(right)
      height: boundaryRect.height * 2
      // win + empty(bottom)
    });
  }
  return pick(boundaryRect, ["x", "y", "width", "height"]);
};
export {
  getBoundaryRect,
  getContentEl,
  getContentId,
  getHeaderEl,
  getHeaderId,
  getPositionerEl,
  getPositionerId,
  getTitleId,
  getTriggerEl,
  getTriggerId
};
