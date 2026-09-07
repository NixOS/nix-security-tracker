// src/listbox.collection.ts
import {
  GridCollection,
  ListCollection
} from "@zag-js/collection";
var collection = (options) => {
  return new ListCollection(options);
};
collection.empty = () => {
  return new ListCollection({ items: [] });
};
var gridCollection = (options) => {
  return new GridCollection(options);
};
gridCollection.empty = () => {
  return new GridCollection({ items: [], columnCount: 0 });
};
export {
  collection,
  gridCollection
};
