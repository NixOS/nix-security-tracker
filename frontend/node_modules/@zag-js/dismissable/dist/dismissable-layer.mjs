// src/dismissable-layer.ts
import { contains, getEventTarget, isHTMLElement, whenNode } from "@zag-js/dom-query";
import {
  trackInteractOutside
} from "@zag-js/interact-outside";
import { warn } from "@zag-js/utils";
import { trackEscapeKeydown } from "./escape-keydown.mjs";
import { layerStack } from "./layer-stack.mjs";
import { assignPointerEventToLayers, clearPointerEvent, disablePointerEventsOutside } from "./pointer-event-outside.mjs";
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
  layerStack.add(layer);
  assignPointerEventToLayers();
  function onPointerDownOutside(event) {
    const target = getEventTarget(event.detail.originalEvent);
    if (layerStack.isBelowPointerBlockingLayer(node) || layerStack.isInBranch(target)) return;
    options.onPointerDownOutside?.(event);
    options.onInteractOutside?.(event);
    if (event.defaultPrevented) return;
    if (debug) {
      console.log("onPointerDownOutside:", event.detail.originalEvent);
    }
    onDismiss?.();
  }
  function onFocusOutside(event) {
    const target = getEventTarget(event.detail.originalEvent);
    if (layerStack.isInBranch(target)) return;
    options.onFocusOutside?.(event);
    options.onInteractOutside?.(event);
    if (event.defaultPrevented) return;
    if (debug) {
      console.log("onFocusOutside:", event.detail.originalEvent);
    }
    onDismiss?.();
  }
  function onEscapeKeyDown(event) {
    if (!layerStack.isTopMost(node)) return;
    options.onEscapeKeyDown?.(event);
    if (!event.defaultPrevented && onDismiss) {
      event.preventDefault();
      onDismiss();
    }
  }
  function exclude(target) {
    const containers = typeof excludeContainers === "function" ? excludeContainers() : excludeContainers;
    const _containers = Array.isArray(containers) ? containers : [containers];
    const persistentElements = options.persistentElements?.map((fn) => fn()).filter(isHTMLElement);
    if (persistentElements) _containers.push(...persistentElements);
    return _containers.some((node2) => contains(node2, target)) || layerStack.isInNestedLayer(node, target);
  }
  const cleanups = [
    pointerBlocking ? disablePointerEventsOutside(node, options.persistentElements) : void 0,
    trackEscapeKeydown(node, onEscapeKeyDown),
    trackInteractOutside(node, { exclude, onFocusOutside, onPointerDownOutside, defer: options.defer })
  ];
  return () => {
    layerStack.remove(node);
    assignPointerEventToLayers();
    clearPointerEvent(node);
    cleanups.forEach((fn) => fn?.());
  };
}
function trackDismissableElement(nodeOrFn, options) {
  const { warnOnMissingNode = true } = options;
  return whenNode(nodeOrFn, (node) => trackDismissableElementImpl(node, options), {
    defer: options.defer,
    onMissing: warnOnMissingNode ? () => warn("[@zag-js/dismissable] node is `null` or `undefined`") : void 0
  });
}
function trackDismissableBranch(nodeOrFn, options = {}) {
  return whenNode(
    nodeOrFn,
    (node) => {
      layerStack.addBranch(node);
      return () => {
        layerStack.removeBranch(node);
      };
    },
    {
      defer: options.defer,
      onMissing: () => warn("[@zag-js/dismissable] branch node is `null` or `undefined`")
    }
  );
}
export {
  trackDismissableBranch,
  trackDismissableElement
};
