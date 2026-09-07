// src/select.collection.ts
import { ListCollection } from "@zag-js/collection";
var collection = (options) => {
  return new ListCollection(options);
};
collection.empty = () => {
  return new ListCollection({ items: [] });
};
export {
  collection
};
