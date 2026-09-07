import "./chunk-QZ7TP4HQ.mjs";

// src/selection-map.ts
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
export {
  createSelectedItemMap,
  deriveSelectionState,
  resolveSelectedItems,
  updateSelectedItemMap
};
