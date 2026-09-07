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

// src/dismissable-layer.ts
var dismissable_layer_exports = {};
__export(dismissable_layer_exports, {
  trackDismissableBranch: () => trackDismissableBranch,
  trackDismissableElement: () => trackDismissableElement
});
module.exports = __toCommonJS(dismissable_layer_exports);
var import_dom_query = require("@zag-js/dom-query");
var import_interact_outside = require("@zag-js/interact-outside");
var import_utils = require("@zag-js/utils");
var import_escape_keydown = require("./escape-keydown.js");
var import_layer_stack = require("./layer-stack.js");
var import_pointer_event_outside = require("./pointer-event-outside.js");
function trackDismissableElementImpl(node, options) {
  const {
    onDismiss,
    onRequestDismiss,
    pointerBlocking,
    exclude: excludeContainers,
    debug,
    type = "dialog",
    layerStyleTargets
  } = options;
  const layer = {
    dismiss: onDismiss,
    node,
    type,
    pointerBlocking,
    requestDismiss: onRequestDismiss,
    styleTargets: layerStyleTargets
  };
  import_layer_stack.layerStack.add(layer);
  (0, import_pointer_event_outside.assignPointerEventToLayers)();
  function onPointerDownOutside(event) {
    const target = (0, import_dom_query.getEventTarget)(event.detail.originalEvent);
    if (import_layer_stack.layerStack.isBelowPointerBlockingLayer(node) || import_layer_stack.layerStack.isInBranch(target)) return;
    options.onPointerDownOutside?.(event);
    options.onInteractOutside?.(event);
    if (event.defaultPrevented) return;
    if (debug) {
      console.log("onPointerDownOutside:", event.detail.originalEvent);
    }
    onDismiss?.();
  }
  function onFocusOutside(event) {
    const target = (0, import_dom_query.getEventTarget)(event.detail.originalEvent);
    if (import_layer_stack.layerStack.isInBranch(target)) return;
    options.onFocusOutside?.(event);
    options.onInteractOutside?.(event);
    if (event.defaultPrevented) return;
    if (debug) {
      console.log("onFocusOutside:", event.detail.originalEvent);
    }
    onDismiss?.();
  }
  function onEscapeKeyDown(event) {
    if (!import_layer_stack.layerStack.isTopMost(node)) return;
    options.onEscapeKeyDown?.(event);
    if (!event.defaultPrevented && onDismiss) {
      event.preventDefault();
      onDismiss();
    }
  }
  function exclude(target) {
    const containers = typeof excludeContainers === "function" ? excludeContainers() : excludeContainers;
    const _containers = Array.isArray(containers) ? containers : [containers];
    const persistentElements = options.persistentElements?.map((fn) => fn()).filter(import_dom_query.isHTMLElement);
    if (persistentElements) _containers.push(...persistentElements);
    return _containers.some((node2) => (0, import_dom_query.contains)(node2, target)) || import_layer_stack.layerStack.isInNestedLayer(node, target);
  }
  const cleanups = [
    pointerBlocking ? (0, import_pointer_event_outside.disablePointerEventsOutside)(node, options.persistentElements) : void 0,
    (0, import_escape_keydown.trackEscapeKeydown)(node, onEscapeKeyDown),
    (0, import_interact_outside.trackInteractOutside)(node, { exclude, onFocusOutside, onPointerDownOutside, defer: options.defer })
  ];
  return () => {
    import_layer_stack.layerStack.remove(node);
    (0, import_pointer_event_outside.assignPointerEventToLayers)();
    (0, import_pointer_event_outside.clearPointerEvent)(node);
    cleanups.forEach((fn) => fn?.());
  };
}
function trackDismissableElement(nodeOrFn, options) {
  const { warnOnMissingNode = true } = options;
  return (0, import_dom_query.whenNode)(nodeOrFn, (node) => trackDismissableElementImpl(node, options), {
    defer: options.defer,
    onMissing: warnOnMissingNode ? () => (0, import_utils.warn)("[@zag-js/dismissable] node is `null` or `undefined`") : void 0
  });
}
function trackDismissableBranch(nodeOrFn, options = {}) {
  return (0, import_dom_query.whenNode)(
    nodeOrFn,
    (node) => {
      import_layer_stack.layerStack.addBranch(node);
      return () => {
        import_layer_stack.layerStack.removeBranch(node);
      };
    },
    {
      defer: options.defer,
      onMissing: () => (0, import_utils.warn)("[@zag-js/dismissable] branch node is `null` or `undefined`")
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  trackDismissableBranch,
  trackDismissableElement
});
