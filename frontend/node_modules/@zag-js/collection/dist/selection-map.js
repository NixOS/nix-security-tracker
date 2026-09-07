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

// src/selection-map.ts
var selection_map_exports = {};
__export(selection_map_exports, {
  createSelectedItemMap: () => createSelectedItemMap,
  deriveSelectionState: () => deriveSelectionState,
  resolveSelectedItems: () => resolveSelectedItems,
  updateSelectedItemMap: () => updateSelectedItemMap
});
module.exports = __toCommonJS(selection_map_exports);
function resolveSelectedItems({
  values,
  collection,
  selectedItemMap
}) {
  const result = [];
  for (const value of values) {
    const item = collection.find(value) ?? selectedItemMap.get(value);
    if (item != null) result.push(item);
  }
  return result;
}
function updateSelectedItemMap({
  selectedItemMap,
  values,
  selectedItems,
  collection
}) {
  const nextMap = new Map(selectedItemMap);
  for (const item of selectedItems) {
    const value = collection.getItemValue(item);
    if (value != null) nextMap.set(value, item);
  }
  const allowedValues = new Set(values);
  for (const value of nextMap.keys()) {
    if (!allowedValues.has(value)) nextMap.delete(value);
  }
  return nextMap;
}
function deriveSelectionState({
  values,
  collection,
  selectedItemMap
}) {
  const selectedItems = resolveSelectedItems({ values, collection, selectedItemMap });
  const nextSelectedItemMap = updateSelectedItemMap({
    selectedItemMap,
    values,
    selectedItems,
    collection
  });
  return { selectedItems, nextSelectedItemMap };
}
function createSelectedItemMap({
  selectedItems,
  collection
}) {
  return updateSelectedItemMap({
    selectedItemMap: /* @__PURE__ */ new Map(),
    values: selectedItems.map((item) => collection.getItemValue(item)).filter(Boolean),
    selectedItems,
    collection
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createSelectedItemMap,
  deriveSelectionState,
  resolveSelectedItems,
  updateSelectedItemMap
});
