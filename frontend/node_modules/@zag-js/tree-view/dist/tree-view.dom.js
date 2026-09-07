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

// src/tree-view.dom.ts
var tree_view_dom_exports = {};
__export(tree_view_dom_exports, {
  focusNode: () => focusNode,
  getLabelId: () => getLabelId,
  getNodeId: () => getNodeId,
  getRenameInputEl: () => getRenameInputEl,
  getRenameInputId: () => getRenameInputId,
  getRootId: () => getRootId,
  getTreeEl: () => getTreeEl,
  getTreeId: () => getTreeId
});
module.exports = __toCommonJS(tree_view_dom_exports);
var getRootId = (ctx) => ctx.ids?.root ?? `tree:${ctx.id}:root`;
var getLabelId = (ctx) => ctx.ids?.label ?? `tree:${ctx.id}:label`;
var getNodeId = (ctx, value) => ctx.ids?.node?.(value) ?? `tree:${ctx.id}:node:${value}`;
var getTreeId = (ctx) => ctx.ids?.tree ?? `tree:${ctx.id}:tree`;
var getTreeEl = (ctx) => ctx.getById(getTreeId(ctx));
var focusNode = (ctx, value) => {
  if (value == null) return;
  ctx.getById(getNodeId(ctx, value))?.focus();
};
var getRenameInputId = (ctx, value) => `tree:${ctx.id}:rename-input:${value}`;
var getRenameInputEl = (ctx, value) => {
  return ctx.getById(getRenameInputId(ctx, value));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  focusNode,
  getLabelId,
  getNodeId,
  getRenameInputEl,
  getRenameInputId,
  getRootId,
  getTreeEl,
  getTreeId
});
