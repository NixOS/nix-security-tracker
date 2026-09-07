// src/file-upload.dom.ts
import { hash } from "@zag-js/utils";
var getRootId = (ctx) => ctx.ids?.root ?? `file:${ctx.id}`;
var getDropzoneId = (ctx) => ctx.ids?.dropzone ?? `file:${ctx.id}:dropzone`;
var getHiddenInputId = (ctx) => ctx.ids?.hiddenInput ?? `file:${ctx.id}:input`;
var getTriggerId = (ctx) => ctx.ids?.trigger ?? `file:${ctx.id}:trigger`;
var getLabelId = (ctx) => ctx.ids?.label ?? `file:${ctx.id}:label`;
var getItemId = (ctx, id) => ctx.ids?.item?.(id) ?? `file:${ctx.id}:item:${id}`;
var getItemNameId = (ctx, id) => ctx.ids?.itemName?.(id) ?? `file:${ctx.id}:item-name:${id}`;
var getItemSizeTextId = (ctx, id) => ctx.ids?.itemSizeText?.(id) ?? `file:${ctx.id}:item-size:${id}`;
var getItemPreviewId = (ctx, id) => ctx.ids?.itemPreview?.(id) ?? `file:${ctx.id}:item-preview:${id}`;
var getItemDeleteTriggerId = (ctx, id) => ctx.ids?.itemDeleteTrigger?.(id) ?? `file:${ctx.id}:item-delete:${id}`;
var getFileId = (file) => hash(`${file.name}-${file.size}`);
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getHiddenInputEl = (ctx) => ctx.getById(getHiddenInputId(ctx));
var getDropzoneEl = (ctx) => ctx.getById(getDropzoneId(ctx));
export {
  getDropzoneEl,
  getDropzoneId,
  getFileId,
  getHiddenInputEl,
  getHiddenInputId,
  getItemDeleteTriggerId,
  getItemId,
  getItemNameId,
  getItemPreviewId,
  getItemSizeTextId,
  getLabelId,
  getRootEl,
  getRootId,
  getTriggerId
};
