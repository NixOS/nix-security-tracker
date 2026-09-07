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

// src/async-list.connect.ts
var async_list_connect_exports = {};
__export(async_list_connect_exports, {
  connect: () => connect
});
module.exports = __toCommonJS(async_list_connect_exports);
function connect(service) {
  const { state, context, send } = service;
  const loading = state.matches("loading", "sorting");
  const sorting = state.matches("sorting");
  const items = context.get("items");
  const cursor = context.get("cursor");
  const empty = items.length === 0;
  const hasMore = cursor != null;
  return {
    items,
    sortDescriptor: context.get("sortDescriptor"),
    loading,
    sorting,
    empty,
    hasMore,
    error: context.get("error"),
    filterText: context.get("filterText"),
    cursor,
    abort() {
      send({ type: "ABORT" });
    },
    reload() {
      send({ type: "RELOAD" });
    },
    loadMore() {
      send({ type: "LOAD_MORE" });
    },
    sort(sortDescriptor) {
      send({ type: "SORT", sortDescriptor });
    },
    setFilterText(filterText) {
      send({ type: "FILTER", filterText });
    },
    clearFilter() {
      send({ type: "FILTER", filterText: "" });
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  connect
});
