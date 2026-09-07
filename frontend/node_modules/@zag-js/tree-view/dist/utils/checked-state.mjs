// src/utils/checked-state.ts
import { add, remove, uniq } from "@zag-js/utils";
function getCheckedState(collection, node, checkedValue) {
  const value = collection.getNodeValue(node);
  if (!collection.isBranchNode(node)) {
    return checkedValue.includes(value);
  }
  const childValues = collection.getDescendantValues(value);
  const allChecked = childValues.every((v) => checkedValue.includes(v));
  const someChecked = childValues.some((v) => checkedValue.includes(v));
  return allChecked ? true : someChecked ? "indeterminate" : false;
}
function toggleBranchChecked(collection, value, checkedValue) {
  const childValues = collection.getDescendantValues(value);
  const allChecked = childValues.every((child) => checkedValue.includes(child));
  return uniq(allChecked ? remove(checkedValue, ...childValues) : add(checkedValue, ...childValues));
}
function getCheckedValueMap(collection, checkedValue) {
  const map = /* @__PURE__ */ new Map();
  collection.visit({
    onEnter: (node) => {
      const value = collection.getNodeValue(node);
      const isBranch = collection.isBranchNode(node);
      const checked = getCheckedState(collection, node, checkedValue);
      map.set(value, {
        type: isBranch ? "branch" : "leaf",
        checked
      });
    }
  });
  return map;
}
export {
  getCheckedState,
  getCheckedValueMap,
  toggleBranchChecked
};
