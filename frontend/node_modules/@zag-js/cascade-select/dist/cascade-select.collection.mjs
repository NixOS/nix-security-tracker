// src/cascade-select.collection.ts
import { TreeCollection } from "@zag-js/collection";
var collection = (options) => {
  return new TreeCollection(options);
};
collection.empty = () => {
  return new TreeCollection({
    rootNode: { value: "ROOT", children: [] }
  });
};
export {
  collection
};
