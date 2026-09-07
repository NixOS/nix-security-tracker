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

// src/state.ts
var state_exports = {};
__export(state_exports, {
  ensureStateIndex: () => ensureStateIndex,
  findTransition: () => findTransition,
  getExitEnterStates: () => getExitEnterStates,
  getStateChain: () => getStateChain,
  getStateDefinition: () => getStateDefinition,
  hasTag: () => hasTag,
  matchesState: () => matchesState,
  resolveStateValue: () => resolveStateValue
});
module.exports = __toCommonJS(state_exports);
var import_utils = require("@zag-js/utils");
var STATE_DELIMITER = ".";
var ABSOLUTE_PREFIX = "#";
var stateIndexCache = /* @__PURE__ */ new WeakMap();
var stateIdIndexCache = /* @__PURE__ */ new WeakMap();
function joinStatePath(parts) {
  return parts.join(STATE_DELIMITER);
}
function isAbsoluteStatePath(value) {
  return value.includes(STATE_DELIMITER);
}
function isExplicitAbsoluteStatePath(value) {
  return value.startsWith(ABSOLUTE_PREFIX);
}
function isChildTarget(value) {
  return value.startsWith(STATE_DELIMITER);
}
function stripAbsolutePrefix(value) {
  return isExplicitAbsoluteStatePath(value) ? value.slice(ABSOLUTE_PREFIX.length) : value;
}
function appendStatePath(base, segment) {
  return base ? `${base}${STATE_DELIMITER}${segment}` : segment;
}
function buildStateIndex(machine) {
  const index = /* @__PURE__ */ new Map();
  const idIndex = /* @__PURE__ */ new Map();
  const visit = (basePath, state) => {
    index.set(basePath, state);
    const stateId = state.id;
    if (stateId) {
      if (idIndex.has(stateId)) {
        (0, import_utils.invariant)(`[zag-js] Duplicate state id: "${stateId}"`);
      }
      idIndex.set(stateId, basePath);
    }
    const childStates = state.states;
    if (!childStates) return;
    (0, import_utils.ensure)(state.initial, () => `[zag-js] Compound state "${basePath}" has child states but no "initial" property`);
    if (!(state.initial in childStates)) {
      (0, import_utils.invariant)(
        `[zag-js] Compound state "${basePath}" has initial "${String(state.initial)}" which is not a child state`
      );
    }
    for (const [childKey, childState] of Object.entries(childStates)) {
      if (!childState) continue;
      const childPath = appendStatePath(basePath, childKey);
      visit(childPath, childState);
    }
  };
  for (const [topKey, topState] of Object.entries(machine.states)) {
    if (!topState) continue;
    visit(topKey, topState);
  }
  return { index, idIndex };
}
function ensureStateIndex(machine) {
  const cached = stateIndexCache.get(machine);
  if (cached) return cached;
  const { index, idIndex } = buildStateIndex(machine);
  stateIndexCache.set(machine, index);
  stateIdIndexCache.set(machine, idIndex);
  return index;
}
function getStatePathById(machine, stateId) {
  ensureStateIndex(machine);
  return stateIdIndexCache.get(machine)?.get(stateId);
}
function toSegments(value) {
  if (!value) return [];
  return String(value).split(STATE_DELIMITER).filter(Boolean);
}
function getStateChain(machine, state) {
  if (!state) return [];
  const stateIndex = ensureStateIndex(machine);
  const segments = toSegments(state);
  const chain = [];
  const statePath = [];
  for (const segment of segments) {
    statePath.push(segment);
    const path = joinStatePath(statePath);
    const current = stateIndex.get(path);
    if (!current) break;
    chain.push({ path, state: current });
  }
  return chain;
}
function resolveAbsoluteStateValue(machine, value) {
  const stateIndex = ensureStateIndex(machine);
  const segments = toSegments(value);
  if (!segments.length) return value;
  const resolved = [];
  for (const segment of segments) {
    resolved.push(segment);
    const path = joinStatePath(resolved);
    if (!stateIndex.has(path)) return value;
  }
  let resolvedPath = joinStatePath(resolved);
  let current = stateIndex.get(resolvedPath);
  while (current?.initial) {
    const nextPath = `${resolvedPath}${STATE_DELIMITER}${current.initial}`;
    const nextState = stateIndex.get(nextPath);
    if (!nextState) break;
    resolvedPath = nextPath;
    current = nextState;
  }
  return resolvedPath;
}
function hasStatePath(machine, value) {
  const stateIndex = ensureStateIndex(machine);
  return stateIndex.has(value);
}
function resolveStateValue(machine, value, source) {
  const stateValue = String(value);
  if (isExplicitAbsoluteStatePath(stateValue)) {
    const stateId = stripAbsolutePrefix(stateValue);
    const statePath = getStatePathById(machine, stateId);
    (0, import_utils.ensure)(statePath, () => `[zag-js] Unknown state id: "${stateId}"`);
    return resolveAbsoluteStateValue(machine, statePath);
  }
  if (isChildTarget(stateValue) && source) {
    const childPath = appendStatePath(source, stateValue.slice(1));
    return resolveAbsoluteStateValue(machine, childPath);
  }
  if (!isAbsoluteStatePath(stateValue) && source) {
    const sourceSegments = toSegments(source);
    for (let index = sourceSegments.length - 1; index >= 1; index--) {
      const base = sourceSegments.slice(0, index).join(STATE_DELIMITER);
      const candidate = appendStatePath(base, stateValue);
      if (hasStatePath(machine, candidate)) return resolveAbsoluteStateValue(machine, candidate);
    }
    if (hasStatePath(machine, stateValue)) return resolveAbsoluteStateValue(machine, stateValue);
  }
  return resolveAbsoluteStateValue(machine, stateValue);
}
function getStateDefinition(machine, state) {
  const chain = getStateChain(machine, state);
  return chain[chain.length - 1]?.state;
}
function findTransition(machine, state, eventType) {
  const chain = getStateChain(machine, state);
  for (let index = chain.length - 1; index >= 0; index--) {
    const transitionMap = chain[index]?.state.on;
    const transition = transitionMap?.[eventType];
    if (transition) return { transitions: transition, source: chain[index]?.path };
  }
  const rootTransitionMap = machine.on;
  return { transitions: rootTransitionMap?.[eventType], source: void 0 };
}
function getExitEnterStates(machine, prevState, nextState, reenter) {
  const prevChain = prevState ? getStateChain(machine, prevState) : [];
  const nextChain = getStateChain(machine, nextState);
  let commonIndex = 0;
  while (commonIndex < prevChain.length && commonIndex < nextChain.length && prevChain[commonIndex]?.path === nextChain[commonIndex]?.path) {
    commonIndex += 1;
  }
  let exiting = prevChain.slice(commonIndex).reverse();
  let entering = nextChain.slice(commonIndex);
  const sameLeaf = prevChain[prevChain.length - 1]?.path === nextChain[nextChain.length - 1]?.path;
  if (reenter && sameLeaf) {
    exiting = prevChain.slice().reverse();
    entering = nextChain;
  }
  return { exiting, entering };
}
function matchesState(current, value) {
  if (!current) return false;
  return current === value || current.startsWith(`${value}${STATE_DELIMITER}`);
}
function hasTag(machine, state, tag) {
  return getStateChain(machine, state).some((item) => item.state.tags?.includes(tag));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ensureStateIndex,
  findTransition,
  getExitEnterStates,
  getStateChain,
  getStateDefinition,
  hasTag,
  matchesState,
  resolveStateValue
});
