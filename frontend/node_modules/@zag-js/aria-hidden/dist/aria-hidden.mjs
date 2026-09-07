// src/aria-hidden.ts
import { walkTreeOutside } from "./walk-tree-outside.mjs";
var getParentNode = (originalTarget) => {
  const target = Array.isArray(originalTarget) ? originalTarget[0] : originalTarget;
  return target.ownerDocument.body;
};
var hideOthers = (originalTarget, parentNode = getParentNode(originalTarget), markerName = "data-aria-hidden", followControlledElements = true) => {
  if (!parentNode) return;
  return walkTreeOutside(originalTarget, {
    parentNode,
    markerName,
    controlAttribute: "aria-hidden",
    explicitBooleanValue: true,
    followControlledElements
  });
};
var inertOthers = (originalTarget, parentNode = getParentNode(originalTarget), markerName = "data-inerted", followControlledElements = true) => {
  if (!parentNode) return;
  return walkTreeOutside(originalTarget, {
    parentNode,
    markerName,
    controlAttribute: "inert",
    explicitBooleanValue: false,
    followControlledElements
  });
};
var supportsInert = () => typeof HTMLElement !== "undefined" && HTMLElement.prototype.hasOwnProperty("inert");
var suppressOthers = (originalTarget, parentNode, markerName = "data-suppressed", followControlledElements = true) => {
  const fn = supportsInert() ? inertOthers : hideOthers;
  return fn(originalTarget, parentNode, markerName, followControlledElements);
};
export {
  hideOthers,
  inertOthers,
  suppressOthers
};
