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

// src/query.ts
var query_exports = {};
__export(query_exports, {
  defaultItemToId: () => defaultItemToId,
  indexOfId: () => indexOfId,
  itemById: () => itemById,
  nextById: () => nextById,
  prevById: () => prevById,
  query: () => query,
  queryAll: () => queryAll
});
module.exports = __toCommonJS(query_exports);
function queryAll(root, selector) {
  return Array.from(root?.querySelectorAll(selector) ?? []);
}
function query(root, selector) {
  return root?.querySelector(selector) ?? null;
}
var defaultItemToId = (v) => v.id;
function itemById(v, id, itemToId = defaultItemToId) {
  return v.find((item) => itemToId(item) === id);
}
function indexOfId(v, id, itemToId = defaultItemToId) {
  const item = itemById(v, id, itemToId);
  return item ? v.indexOf(item) : -1;
}
function nextById(v, id, loop = true) {
  let idx = indexOfId(v, id);
  idx = loop ? (idx + 1) % v.length : Math.min(idx + 1, v.length - 1);
  return v[idx];
}
function prevById(v, id, loop = true) {
  let idx = indexOfId(v, id);
  if (idx === -1) return loop ? v[v.length - 1] : null;
  idx = loop ? (idx - 1 + v.length) % v.length : Math.max(0, idx - 1);
  return v[idx];
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  defaultItemToId,
  indexOfId,
  itemById,
  nextById,
  prevById,
  query,
  queryAll
});
