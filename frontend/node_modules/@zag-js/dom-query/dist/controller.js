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

// src/controller.ts
var controller_exports = {};
__export(controller_exports, {
  findControlledElements: () => findControlledElements,
  getControlledElements: () => getControlledElements,
  hasControllerElements: () => hasControllerElements,
  isControlledByExpandedController: () => isControlledByExpandedController,
  isControlledElement: () => isControlledElement,
  isControllerElement: () => isControllerElement,
  isInteractiveContainerElement: () => isInteractiveContainerElement
});
module.exports = __toCommonJS(controller_exports);
var import_node = require("./node.js");
var INTERACTIVE_CONTAINER_ROLE = /* @__PURE__ */ new Set(["menu", "listbox", "dialog", "grid", "tree", "region", "application"]);
var isInteractiveContainerRole = (role) => INTERACTIVE_CONTAINER_ROLE.has(role);
var getAriaControls = (element) => element.getAttribute("aria-controls")?.split(" ") || [];
function isControlledElement(container, element) {
  const visitedIds = /* @__PURE__ */ new Set();
  const rootNode = (0, import_node.getRootNode)(container);
  const checkElement = (searchRoot) => {
    const controllingElements = searchRoot.querySelectorAll("[aria-controls]");
    for (const controller of controllingElements) {
      if (controller.getAttribute("aria-expanded") !== "true") continue;
      const controlledIds = getAriaControls(controller);
      for (const id of controlledIds) {
        if (!id || visitedIds.has(id)) continue;
        visitedIds.add(id);
        const controlledElement = rootNode.getElementById(id);
        if (controlledElement) {
          const role = controlledElement.getAttribute("role");
          const modal = controlledElement.getAttribute("aria-modal") === "true";
          if (role && isInteractiveContainerRole(role) && !modal) {
            if (controlledElement === element || controlledElement.contains(element)) {
              return true;
            }
            if (checkElement(controlledElement)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };
  return checkElement(container);
}
function findControlledElements(searchRoot, callback) {
  const rootNode = (0, import_node.getRootNode)(searchRoot);
  const visitedIds = /* @__PURE__ */ new Set();
  const findRecursive = (root) => {
    const controllingElements = root.querySelectorAll("[aria-controls]");
    for (const controller of controllingElements) {
      if (controller.getAttribute("aria-expanded") !== "true") continue;
      const controlledIds = getAriaControls(controller);
      for (const id of controlledIds) {
        if (!id || visitedIds.has(id)) continue;
        visitedIds.add(id);
        const controlledElement = rootNode.getElementById(id);
        if (controlledElement) {
          const role = controlledElement.getAttribute("role");
          const modal = controlledElement.getAttribute("aria-modal") === "true";
          if (role && INTERACTIVE_CONTAINER_ROLE.has(role) && !modal) {
            callback(controlledElement);
            findRecursive(controlledElement);
          }
        }
      }
    }
  };
  findRecursive(searchRoot);
}
function getControlledElements(container) {
  const controlledElements = /* @__PURE__ */ new Set();
  findControlledElements(container, (controlledElement) => {
    if (!container.contains(controlledElement)) {
      controlledElements.add(controlledElement);
    }
  });
  return Array.from(controlledElements);
}
function isInteractiveContainerElement(element) {
  const role = element.getAttribute("role");
  return Boolean(role && INTERACTIVE_CONTAINER_ROLE.has(role));
}
function isControllerElement(element) {
  return element.hasAttribute("aria-controls") && element.getAttribute("aria-expanded") === "true";
}
function hasControllerElements(element) {
  if (isControllerElement(element)) return true;
  return Boolean(element.querySelector?.('[aria-controls][aria-expanded="true"]'));
}
function isControlledByExpandedController(element) {
  if (!element.id) return false;
  const rootNode = (0, import_node.getRootNode)(element);
  const escapedId = CSS.escape(element.id);
  const selector = `[aria-controls~="${escapedId}"][aria-expanded="true"], [aria-controls="${escapedId}"][aria-expanded="true"]`;
  const controller = rootNode.querySelector(selector);
  return Boolean(controller && isInteractiveContainerElement(element));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  findControlledElements,
  getControlledElements,
  hasControllerElements,
  isControlledByExpandedController,
  isControlledElement,
  isControllerElement,
  isInteractiveContainerElement
});
