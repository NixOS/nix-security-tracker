"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/file-upload.dom.ts
var file_upload_dom_exports = {};
__export(file_upload_dom_exports, {
  getDropzoneEl: () => getDropzoneEl,
  getDropzoneId: () => getDropzoneId,
  getFileId: () => getFileId,
  getHiddenInputEl: () => getHiddenInputEl,
  getHiddenInputId: () => getHiddenInputId,
  getItemDeleteTriggerId: () => getItemDeleteTriggerId,
  getItemId: () => getItemId,
  getItemNameId: () => getItemNameId,
  getItemPreviewId: () => getItemPreviewId,
  getItemSizeTextId: () => getItemSizeTextId,
  getLabelId: () => getLabelId,
  getRootEl: () => getRootEl,
  getRootId: () => getRootId,
  getTriggerId: () => getTriggerId
});
module.exports = __toCommonJS(file_upload_dom_exports);
var import_utils = require("@zag-js/utils");
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
var getFileId = (file) => (0, import_utils.hash)(`${file.name}-${file.size}`);
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getHiddenInputEl = (ctx) => ctx.getById(getHiddenInputId(ctx));
var getDropzoneEl = (ctx) => ctx.getById(getDropzoneId(ctx));
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
