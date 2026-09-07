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

// src/utils/expand-branch.ts
var expand_branch_exports = {};
__export(expand_branch_exports, {
  expandBranches: () => expandBranches
});
module.exports = __toCommonJS(expand_branch_exports);
var import_core = require("@zag-js/core");
var import_utils = require("@zag-js/utils");
function expandBranches(params, values) {
  const { context, prop, refs } = params;
  if (!prop("loadChildren")) {
    context.set("expandedValue", (prev) => (0, import_utils.uniq)((0, import_utils.add)(prev, ...values)));
    return;
  }
  const loadingStatus = context.get("loadingStatus");
  const [loadedValues, loadingValues] = (0, import_utils.partition)(values, (value) => loadingStatus[value] === "loaded");
  if (loadedValues.length > 0) {
    context.set("expandedValue", (prev) => (0, import_utils.uniq)((0, import_utils.add)(prev, ...loadedValues)));
  }
  if (loadingValues.length === 0) return;
  const collection = prop("collection");
  const [nodeWithChildren, nodeWithoutChildren] = (0, import_utils.partition)(loadingValues, (id) => {
    const node = collection.findNode(id);
    return collection.getNodeChildren(node).length > 0;
  });
  if (nodeWithChildren.length > 0) {
    context.set("expandedValue", (prev) => (0, import_utils.uniq)((0, import_utils.add)(prev, ...nodeWithChildren)));
  }
  if (nodeWithoutChildren.length === 0) return;
  context.set("loadingStatus", (prev) => ({
    ...prev,
    ...nodeWithoutChildren.reduce((acc, id) => ({ ...acc, [id]: "loading" }), {})
  }));
  const nodesToLoad = nodeWithoutChildren.map((id) => {
    const indexPath = collection.getIndexPath(id);
    const valuePath = collection.getValuePath(indexPath);
    const node = collection.findNode(id);
    return { id, indexPath, valuePath, node };
  });
  const pendingAborts = refs.get("pendingAborts");
  const loadChildren = prop("loadChildren");
  (0, import_utils.ensure)(loadChildren, () => "[zag-js/tree-view] `loadChildren` is required for async expansion");
  const proms = nodesToLoad.map(({ id, indexPath, valuePath, node }) => {
    const existingAbort = pendingAborts.get(id);
    if (existingAbort) {
      existingAbort.abort();
      pendingAborts.delete(id);
    }
    const abortController = new AbortController();
    pendingAborts.set(id, abortController);
    return loadChildren({
      valuePath,
      indexPath,
      node,
      signal: abortController.signal
    });
  });
  Promise.allSettled(proms).then((results) => {
    const loadedValues2 = [];
    const nodeWithErrors = [];
    const nextLoadingStatus = context.get("loadingStatus");
    let collection2 = prop("collection");
    results.forEach((result, index) => {
      const { id, indexPath, node, valuePath } = nodesToLoad[index];
      if (result.status === "fulfilled") {
        nextLoadingStatus[id] = "loaded";
        loadedValues2.push(id);
        collection2 = collection2.replace(indexPath, { ...node, children: result.value });
      } else {
        pendingAborts.delete(id);
        Reflect.deleteProperty(nextLoadingStatus, id);
        nodeWithErrors.push({ node, error: result.reason, indexPath, valuePath });
      }
    });
    context.set("loadingStatus", nextLoadingStatus);
    if (loadedValues2.length) {
      context.set("expandedValue", (prev) => (0, import_utils.uniq)((0, import_utils.add)(prev, ...loadedValues2)));
      prop("onLoadChildrenComplete")?.({ collection: collection2 });
    }
    if (nodeWithErrors.length) {
      prop("onLoadChildrenError")?.({ nodes: nodeWithErrors });
    }
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  expandBranches
});
