// src/tree-view.collection.ts
import { TreeCollection, filePathToTree } from "@zag-js/collection";
var collection = (options) => {
  return new TreeCollection(options);
};
collection.empty = () => {
  return new TreeCollection({ rootNode: { children: [] } });
};
function filePathCollection(paths) {
  return filePathToTree(paths);
}
export {
  collection,
  filePathCollection
};
