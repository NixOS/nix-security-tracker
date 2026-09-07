// src/tree-view.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("tree-view").parts(
  "branch",
  "branchContent",
  "branchControl",
  "branchIndentGuide",
  "branchIndicator",
  "branchText",
  "branchTrigger",
  "item",
  "itemIndicator",
  "itemText",
  "label",
  "nodeCheckbox",
  "nodeRenameInput",
  "root",
  "tree"
);
var parts = anatomy.build();
export {
  anatomy,
  parts
};
