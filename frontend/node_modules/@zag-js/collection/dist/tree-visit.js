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

// src/tree-visit.ts
var tree_visit_exports = {};
__export(tree_visit_exports, {
  access: () => access,
  accessPath: () => accessPath,
  ancestorIndexPaths: () => ancestorIndexPaths,
  compareIndexPaths: () => compareIndexPaths,
  filter: () => filter,
  find: () => find,
  findAll: () => findAll,
  findAllIndexPaths: () => findAllIndexPaths,
  findIndexPath: () => findIndexPath,
  flat: () => flat,
  flatMap: () => flatMap,
  flatten: () => flatten,
  insert: () => insert,
  map: () => map,
  move: () => move,
  reduce: () => reduce,
  remove: () => remove,
  replace: () => replace,
  sortIndexPaths: () => sortIndexPaths,
  visit: () => visit
});
module.exports = __toCommonJS(tree_visit_exports);
function access(node, indexPath, options) {
  for (let i = 0; i < indexPath.length; i++) node = options.getChildren(node, indexPath.slice(i + 1))[indexPath[i]];
  return node;
}
function accessPath(node, indexPath, options) {
  const result = [node];
  for (let i = 0; i < indexPath.length; i++) {
    node = options.getChildren(node, indexPath.slice(i + 1))[indexPath[i]];
    result.push(node);
  }
  return result;
}
function ancestorIndexPaths(indexPaths) {
  const sortedPaths = sortIndexPaths(indexPaths);
  const result = [];
  const seen = /* @__PURE__ */ new Set();
  for (const indexPath of sortedPaths) {
    const key = indexPath.join();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(indexPath);
    }
  }
  return result;
}
function compareIndexPaths(a, b) {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }
  return a.length - b.length;
}
function sortIndexPaths(indexPaths) {
  return indexPaths.sort(compareIndexPaths);
}
function find(node, options) {
  let found;
  visit(node, {
    ...options,
    onEnter: (child, indexPath) => {
      if (options.predicate(child, indexPath)) {
        found = child;
        return "stop";
      }
    }
  });
  return found;
}
function findAll(node, options) {
  const found = [];
  visit(node, {
    onEnter: (child, indexPath) => {
      if (options.predicate(child, indexPath)) found.push(child);
    },
    getChildren: options.getChildren
  });
  return found;
}
function findIndexPath(node, options) {
  let found;
  visit(node, {
    onEnter: (child, indexPath) => {
      if (options.predicate(child, indexPath)) {
        found = [...indexPath];
        return "stop";
      }
    },
    getChildren: options.getChildren
  });
  return found;
}
function findAllIndexPaths(node, options) {
  let found = [];
  visit(node, {
    onEnter: (child, indexPath) => {
      if (options.predicate(child, indexPath)) found.push([...indexPath]);
    },
    getChildren: options.getChildren
  });
  return found;
}
function reduce(node, options) {
  let result = options.initialResult;
  visit(node, {
    ...options,
    onEnter: (child, indexPath) => {
      result = options.nextResult(result, child, indexPath);
    }
  });
  return result;
}
function flat(node, options) {
  return reduce(node, {
    ...options,
    initialResult: [],
    nextResult: (result, child) => {
      result.push(child);
      return result;
    }
  });
}
function flatMap(node, options) {
  return reduce(node, {
    ...options,
    initialResult: [],
    nextResult: (result, child, indexPath) => {
      result.push(...options.transform(child, indexPath));
      return result;
    }
  });
}
function filter(node, options) {
  const { predicate, create, getChildren } = options;
  const filterRecursive = (node2, indexPath) => {
    const children = getChildren(node2, indexPath);
    const filteredChildren = [];
    children.forEach((child, index) => {
      const childIndexPath = [...indexPath, index];
      const filteredChild = filterRecursive(child, childIndexPath);
      if (filteredChild) filteredChildren.push(filteredChild);
    });
    const isRoot = indexPath.length === 0;
    const nodeMatches = predicate(node2, indexPath);
    const hasFilteredChildren = filteredChildren.length > 0;
    if (isRoot || nodeMatches || hasFilteredChildren) {
      return create(node2, filteredChildren, indexPath);
    }
    return null;
  };
  return filterRecursive(node, []) || create(node, [], []);
}
function flatten(rootNode, options) {
  const nodes = [];
  let idx = 0;
  const idxMap = /* @__PURE__ */ new Map();
  const parentMap = /* @__PURE__ */ new Map();
  visit(rootNode, {
    getChildren: options.getChildren,
    onEnter: (node, indexPath) => {
      if (!idxMap.has(node)) {
        idxMap.set(node, idx++);
      }
      const children = options.getChildren(node, indexPath);
      children.forEach((child) => {
        if (!parentMap.has(child)) {
          parentMap.set(child, node);
        }
        if (!idxMap.has(child)) {
          idxMap.set(child, idx++);
        }
      });
      const _children = children.length > 0 ? children.map((child) => idxMap.get(child)) : void 0;
      const parent = parentMap.get(node);
      const _parent = parent ? idxMap.get(parent) : void 0;
      const _index = idxMap.get(node);
      nodes.push({ ...node, _children, _parent, _index });
    }
  });
  return nodes;
}
function insertOperation(index, nodes) {
  return { type: "insert", index, nodes };
}
function removeOperation(indexes) {
  return { type: "remove", indexes };
}
function replaceOperation() {
  return { type: "replace" };
}
function splitIndexPath(indexPath) {
  return [indexPath.slice(0, -1), indexPath[indexPath.length - 1]];
}
function getInsertionOperations(indexPath, nodes, operations = /* @__PURE__ */ new Map()) {
  const [parentIndexPath, index] = splitIndexPath(indexPath);
  for (let i = parentIndexPath.length - 1; i >= 0; i--) {
    const parentKey = parentIndexPath.slice(0, i).join();
    switch (operations.get(parentKey)?.type) {
      case "remove":
        continue;
    }
    operations.set(parentKey, replaceOperation());
  }
  const operation = operations.get(parentIndexPath.join());
  switch (operation?.type) {
    case "remove":
      operations.set(parentIndexPath.join(), {
        type: "removeThenInsert",
        removeIndexes: operation.indexes,
        insertIndex: index,
        insertNodes: nodes
      });
      break;
    default:
      operations.set(parentIndexPath.join(), insertOperation(index, nodes));
  }
  return operations;
}
function getRemovalOperations(indexPaths) {
  const operations = /* @__PURE__ */ new Map();
  const indexesToRemove = /* @__PURE__ */ new Map();
  for (const indexPath of indexPaths) {
    const parentKey = indexPath.slice(0, -1).join();
    const value = indexesToRemove.get(parentKey) ?? [];
    value.push(indexPath[indexPath.length - 1]);
    indexesToRemove.set(
      parentKey,
      value.sort((a, b) => a - b)
    );
  }
  for (const indexPath of indexPaths) {
    for (let i = indexPath.length - 2; i >= 0; i--) {
      const parentKey = indexPath.slice(0, i).join();
      if (!operations.has(parentKey)) {
        operations.set(parentKey, replaceOperation());
      }
    }
  }
  for (const [parentKey, indexes] of indexesToRemove) {
    operations.set(parentKey, removeOperation(indexes));
  }
  return operations;
}
function getReplaceOperations(indexPath, node) {
  const operations = /* @__PURE__ */ new Map();
  const [parentIndexPath, index] = splitIndexPath(indexPath);
  for (let i = parentIndexPath.length - 1; i >= 0; i--) {
    const parentKey = parentIndexPath.slice(0, i).join();
    operations.set(parentKey, replaceOperation());
  }
  operations.set(parentIndexPath.join(), {
    type: "removeThenInsert",
    removeIndexes: [index],
    insertIndex: index,
    insertNodes: [node]
  });
  return operations;
}
function mutate(node, operations, options) {
  return map(node, {
    ...options,
    getChildren: (node2, indexPath) => {
      const key = indexPath.join();
      const operation = operations.get(key);
      switch (operation?.type) {
        case "replace":
        case "remove":
        case "removeThenInsert":
        case "insert":
          return options.getChildren(node2, indexPath);
        default:
          return [];
      }
    },
    transform: (node2, children, indexPath) => {
      const key = indexPath.join();
      const operation = operations.get(key);
      switch (operation?.type) {
        case "remove":
          return options.create(
            node2,
            children.filter((_, index) => !operation.indexes.includes(index)),
            indexPath
          );
        case "removeThenInsert":
          const updatedChildren = children.filter((_, index) => !operation.removeIndexes.includes(index));
          const adjustedIndex = operation.removeIndexes.reduce(
            (index, removedIndex) => removedIndex < index ? index - 1 : index,
            operation.insertIndex
          );
          return options.create(node2, splice(updatedChildren, adjustedIndex, 0, ...operation.insertNodes), indexPath);
        case "insert":
          return options.create(node2, splice(children, operation.index, 0, ...operation.nodes), indexPath);
        case "replace":
          return options.create(node2, children, indexPath);
        default:
          return node2;
      }
    }
  });
}
function splice(array, start, deleteCount, ...items) {
  return [...array.slice(0, start), ...items, ...array.slice(start + deleteCount)];
}
function map(node, options) {
  const childrenMap = {};
  visit(node, {
    ...options,
    onLeave: (child, indexPath) => {
      const keyIndexPath = [0, ...indexPath];
      const key = keyIndexPath.join();
      const transformed = options.transform(child, childrenMap[key] ?? [], indexPath);
      const parentKey = keyIndexPath.slice(0, -1).join();
      const parentChildren = childrenMap[parentKey] ?? [];
      parentChildren.push(transformed);
      childrenMap[parentKey] = parentChildren;
    }
  });
  return childrenMap[""][0];
}
function insert(node, options) {
  const { nodes, at } = options;
  if (at.length === 0) throw new Error(`Can't insert nodes at the root`);
  const state = getInsertionOperations(at, nodes);
  return mutate(node, state, options);
}
function replace(node, options) {
  if (options.at.length === 0) return options.node;
  const operations = getReplaceOperations(options.at, options.node);
  return mutate(node, operations, options);
}
function remove(node, options) {
  if (options.indexPaths.length === 0) return node;
  for (const indexPath of options.indexPaths) {
    if (indexPath.length === 0) throw new Error(`Can't remove the root node`);
  }
  const operations = getRemovalOperations(options.indexPaths);
  return mutate(node, operations, options);
}
function move(node, options) {
  if (options.indexPaths.length === 0) return node;
  for (const indexPath of options.indexPaths) {
    if (indexPath.length === 0) throw new Error(`Can't move the root node`);
  }
  if (options.to.length === 0) throw new Error(`Can't move nodes to the root`);
  const _ancestorIndexPaths = ancestorIndexPaths(options.indexPaths);
  const nodesToInsert = _ancestorIndexPaths.map((indexPath) => access(node, indexPath, options));
  const operations = getInsertionOperations(options.to, nodesToInsert, getRemovalOperations(_ancestorIndexPaths));
  return mutate(node, operations, options);
}
function visit(node, options) {
  const { onEnter, onLeave, getChildren } = options;
  let indexPath = [];
  let stack = [{ node }];
  const getIndexPath = options.reuseIndexPath ? () => indexPath : () => indexPath.slice();
  while (stack.length > 0) {
    let wrapper = stack[stack.length - 1];
    if (wrapper.state === void 0) {
      const enterResult = onEnter?.(wrapper.node, getIndexPath());
      if (enterResult === "stop") return;
      wrapper.state = enterResult === "skip" ? -1 : 0;
    }
    const children = wrapper.children || getChildren(wrapper.node, getIndexPath());
    wrapper.children || (wrapper.children = children);
    if (wrapper.state !== -1) {
      if (wrapper.state < children.length) {
        let currentIndex = wrapper.state;
        indexPath.push(currentIndex);
        stack.push({ node: children[currentIndex] });
        wrapper.state = currentIndex + 1;
        continue;
      }
      const leaveResult = onLeave?.(wrapper.node, getIndexPath());
      if (leaveResult === "stop") return;
    }
    indexPath.pop();
    stack.pop();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  access,
  accessPath,
  ancestorIndexPaths,
  compareIndexPaths,
  filter,
  find,
  findAll,
  findAllIndexPaths,
  findIndexPath,
  flat,
  flatMap,
  flatten,
  insert,
  map,
  move,
  reduce,
  remove,
  replace,
  sortIndexPaths,
  visit
});
