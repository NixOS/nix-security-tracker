// src/tags-input.dom.ts
import { dispatchInputValueEvent, indexOfId, nextById, prevById, queryAll } from "@zag-js/dom-query";
var getRootId = (ctx) => ctx.ids?.root ?? `tags-input:${ctx.id}`;
var getInputId = (ctx) => ctx.ids?.input ?? `tags-input:${ctx.id}:input`;
var getClearTriggerId = (ctx) => ctx.ids?.clearBtn ?? `tags-input:${ctx.id}:clear-btn`;
var getHiddenInputId = (ctx) => ctx.ids?.hiddenInput ?? `tags-input:${ctx.id}:hidden-input`;
var getLabelId = (ctx) => ctx.ids?.label ?? `tags-input:${ctx.id}:label`;
var getControlId = (ctx) => ctx.ids?.control ?? `tags-input:${ctx.id}:control`;
var getItemId = (ctx, opt) => ctx.ids?.item?.(opt) ?? `tags-input:${ctx.id}:tag:${opt.value}:${opt.index}`;
var getItemDeleteTriggerId = (ctx, opt) => ctx.ids?.itemDeleteTrigger?.(opt) ?? `${getItemId(ctx, opt)}:delete-btn`;
var getItemInputId = (ctx, opt) => ctx.ids?.itemInput?.(opt) ?? `${getItemId(ctx, opt)}:input`;
var getEditInputId = (id) => `${id}:input`;
var getEditInputEl = (ctx, id) => ctx.getById(getEditInputId(id));
var getItemEls = (ctx) => queryAll(getRootEl(ctx), `[data-part=item]`);
var getTagInputEl = (ctx, opt) => ctx.getById(getItemInputId(ctx, opt));
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getInputEl = (ctx) => ctx.getById(getInputId(ctx));
var getHiddenInputEl = (ctx) => ctx.getById(getHiddenInputId(ctx));
var getTagElements = (ctx) => queryAll(getRootEl(ctx), `[data-part=item-preview]:not([data-disabled])`);
var getFirstEl = (ctx) => getTagElements(ctx)[0];
var getLastEl = (ctx) => getTagElements(ctx)[getTagElements(ctx).length - 1];
var getPrevEl = (ctx, id) => prevById(getTagElements(ctx), id, false);
var getNextEl = (ctx, id) => nextById(getTagElements(ctx), id, false);
var getTagElAtIndex = (ctx, index) => getTagElements(ctx)[index];
var getIndexOfId = (ctx, id) => indexOfId(getTagElements(ctx), id);
var isInputFocused = (ctx) => ctx.isActiveElement(getInputEl(ctx));
var getTagValue = (ctx, id) => {
  if (!id) return null;
  const tagEl = ctx.getById(id);
  return tagEl?.dataset.value ?? null;
};
var setHoverIntent = (el) => {
  const tagEl = el.closest("[data-part=item-preview]");
  if (!tagEl) return;
  tagEl.dataset.deleteIntent = "";
};
var clearHoverIntent = (el) => {
  const tagEl = el.closest("[data-part=item-preview]");
  if (!tagEl) return;
  delete tagEl.dataset.deleteIntent;
};
var dispatchInputEvent = (ctx, value) => {
  const inputEl = getHiddenInputEl(ctx);
  if (!inputEl) return;
  dispatchInputValueEvent(inputEl, { value });
};
export {
  clearHoverIntent,
  dispatchInputEvent,
  getClearTriggerId,
  getControlId,
  getEditInputEl,
  getEditInputId,
  getFirstEl,
  getHiddenInputEl,
  getHiddenInputId,
  getIndexOfId,
  getInputEl,
  getInputId,
  getItemDeleteTriggerId,
  getItemEls,
  getItemId,
  getItemInputId,
  getLabelId,
  getLastEl,
  getNextEl,
  getPrevEl,
  getRootEl,
  getRootId,
  getTagElAtIndex,
  getTagElements,
  getTagInputEl,
  getTagValue,
  isInputFocused,
  setHoverIntent
};
