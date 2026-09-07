"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/navigation-menu.machine.ts
var navigation_menu_machine_exports = {};
__export(navigation_menu_machine_exports, {
  machine: () => machine
});
module.exports = __toCommonJS(navigation_menu_machine_exports);
var import_core = require("@zag-js/core");
var import_dismissable = require("@zag-js/dismissable");
var import_dom_query = require("@zag-js/dom-query");
var import_utils = require("@zag-js/utils");
var dom = __toESM(require("./navigation-menu.dom.js"));
var import_navigation_menu = require("./navigation-menu.utils.js");
var { createMachine } = (0, import_core.setup)();
var machine = createMachine({
  props({ props }) {
    (0, import_utils.ensureProps)(props, ["id"]);
    return {
      dir: "ltr",
      openDelay: 200,
      closeDelay: 300,
      orientation: "horizontal",
      defaultValue: "",
      ...props
    };
  },
  context({ prop, bindable }) {
    return {
      // value tracking
      value: bindable(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        sync: true,
        onChange(value) {
          prop("onValueChange")?.({ value });
        }
      })),
      previousValue: bindable(() => ({
        defaultValue: "",
        sync: true
      })),
      // viewport
      viewportSize: bindable(() => ({
        defaultValue: null,
        sync: true
      })),
      isViewportRendered: bindable(() => ({
        defaultValue: false
      })),
      viewportPosition: bindable(() => ({
        defaultValue: null
      })),
      // nodes
      contentNode: bindable(() => ({
        defaultValue: null
      })),
      triggerRect: bindable(() => ({
        defaultValue: null,
        sync: true
      })),
      triggerNode: bindable(() => ({
        defaultValue: null
      }))
    };
  },
  computed: {
    open: ({ context }) => context.get("value") != null
  },
  watch({ track, action, context }) {
    track([() => context.get("value")], () => {
      action(["restoreTabOrder", "setTriggerNode", "syncContentNode", "syncMotionAttribute"]);
    });
  },
  refs() {
    return {
      restoreContentTabOrder: void 0,
      contentResizeObserverCleanup: void 0,
      contentDismissableCleanup: void 0,
      contentExitCompleteCleanup: void 0,
      triggerResizeObserverCleanup: void 0,
      closeTimeoutId: null,
      openTimeoutIds: {}
    };
  },
  entry: ["checkViewportNode"],
  exit: ["cleanupObservers"],
  effects: ["trackDocumentResize"],
  initialState() {
    return "idle";
  },
  on: {
    "VALUE.SET": {
      actions: ["setValue"]
    },
    "VIEWPORT.POSITION": {
      actions: ["setViewportPosition"]
    },
    "TRIGGER.POINTERENTER": {
      actions: ["clearCloseTimeout", "setValueWithDelay"]
    },
    "TRIGGER.POINTERLEAVE": [
      {
        actions: ["setCloseTimeout", "resetValueWithDelay"]
      }
    ],
    "TRIGGER.CLICK": [
      {
        guard: "isItemOpen",
        actions: ["deselectValue"]
      },
      {
        actions: ["selectValue"]
      }
    ],
    "CONTENT.FOCUS": {
      actions: ["restoreTabOrder", "focusFirstTabbableEl"]
    },
    "CONTENT.BLUR": {
      actions: ["removeFromTabOrder"]
    },
    "CONTENT.POINTERENTER": {
      actions: ["clearCloseTimeout"]
    },
    "CONTENT.POINTERLEAVE": {
      actions: ["setCloseTimeout"]
    },
    "ITEM.NAVIGATE": {
      actions: ["focusNextLink"]
    },
    "ITEM.CLOSE": {
      actions: ["focusTrigger", "deselectValue"]
    },
    CLOSE: {
      actions: ["clearAllOpenTimeouts", "deselectValue", "focusTriggerIfNeeded", "removeFromTabOrder"]
    }
  },
  states: {
    idle: {}
  },
  implementations: {
    guards: {
      isItemOpen: ({ context, event }) => context.get("value") === event.value
    },
    effects: {
      trackDocumentResize({ scope, send }) {
        const doc = scope.getDoc();
        return dom.trackResizeObserver([doc.body, dom.getRootEl(scope)], () => {
          send({ type: "VIEWPORT.POSITION" });
        });
      }
    },
    actions: {
      setValue({ context, event }) {
        context.set("value", event.value);
      },
      clearCloseTimeout({ refs }) {
        (0, import_navigation_menu.clearCloseTimeout)(refs);
      },
      clearAllOpenTimeouts({ refs }) {
        (0, import_navigation_menu.clearAllOpenTimeouts)(refs);
      },
      setCloseTimeout({ refs, context, prop }) {
        (0, import_navigation_menu.setCloseTimeout)(refs, context, prop);
      },
      resetValueWithDelay({ event, refs }) {
        (0, import_navigation_menu.clearOpenTimeout)(refs, event.value);
      },
      setValueWithDelay({ event, prop, context, refs }) {
        const shouldSkipDelay = context.get("value") !== "";
        const openTimeoutId = window.setTimeout(
          () => {
            setTimeout(() => {
              context.set("previousValue", context.get("value"));
              context.set("value", event.value);
            });
          },
          shouldSkipDelay ? 0 : prop("openDelay")
        );
        (0, import_navigation_menu.setOpenTimeout)(refs, event.value, openTimeoutId);
      },
      selectValue: ({ context, event }) => {
        context.set("previousValue", context.get("value"));
        context.set("value", event.value);
      },
      deselectValue: ({ context }) => {
        context.set("value", "");
        context.set("previousValue", "");
      },
      syncContentNode({ context, scope, refs, send }) {
        refs.get("contentResizeObserverCleanup")?.();
        refs.get("contentDismissableCleanup")?.();
        refs.get("contentExitCompleteCleanup")?.();
        const previousValue = context.get("previousValue");
        if (previousValue) {
          const previousContentEl = dom.getContentEl(scope, previousValue);
          const viewportEl = dom.getViewportEl(scope);
          if (previousContentEl) {
            const onExitComplete = () => context.set("previousValue", "");
            refs.set(
              "contentExitCompleteCleanup",
              (0, import_utils.callAll)(
                (0, import_dom_query.addDomEvent)(previousContentEl, "exitcomplete", onExitComplete),
                (0, import_dom_query.addDomEvent)(viewportEl, "exitcomplete", onExitComplete)
              )
            );
          }
        }
        const contentEl = dom.getContentEl(scope, context.get("value"));
        if (!contentEl) return;
        context.set("contentNode", contentEl);
        if (context.get("isViewportRendered")) {
          const contentResizeObserver = dom.trackResizeObserver([contentEl], () => {
            const contentEl2 = dom.getContentEl(scope, context.get("value"));
            if (!contentEl2) return;
            context.set("viewportSize", { width: contentEl2.offsetWidth, height: contentEl2.offsetHeight });
            send({ type: "VIEWPORT.POSITION" });
          });
          refs.set("contentResizeObserverCleanup", contentResizeObserver);
        }
        const getContentEl2 = () => {
          return dom.getViewportEl(scope) || dom.getContentEl(scope, context.get("value"));
        };
        const contentDismissable = (0, import_dismissable.trackDismissableElement)(getContentEl2, {
          defer: true,
          onFocusOutside(event) {
            const target = event.detail.target;
            if (target.matches("[data-scope=navigation-menu][data-part=trigger]") || target.matches("[data-trigger-proxy]")) {
              event.preventDefault();
            }
            if (!event.defaultPrevented) {
              send({ type: "CONTENT.BLUR" });
              if ((0, import_dom_query.contains)(dom.getRootEl(scope), target)) {
                event.preventDefault();
              }
            }
          },
          onPointerDownOutside(event) {
            const target = event.detail.target;
            if (!event.defaultPrevented) {
              const isTrigger = dom.getTriggerEls(scope).some((node) => node.contains(target));
              const isRootViewport = (0, import_dom_query.contains)(dom.getViewportEl(scope), target);
              if (isTrigger || isRootViewport) {
                event.preventDefault();
              }
            }
          },
          onDismiss() {
            send({ type: "CLOSE", value: context.get("value") });
          }
        });
        refs.set("contentDismissableCleanup", contentDismissable);
      },
      setTriggerNode({ context, scope, refs }) {
        refs.get("triggerResizeObserverCleanup")?.();
        const node = dom.getTriggerEl(scope, context.get("value"));
        if (!node) return;
        context.set("triggerNode", node);
        const exec = () => {
          const rect = { x: node.offsetLeft, y: node.offsetTop, width: node.offsetWidth, height: node.offsetHeight };
          context.set("triggerRect", rect);
        };
        const listEl = dom.getListEl(scope);
        const triggerResizeObserver = dom.trackResizeObserver([node, listEl], exec);
        refs.set("triggerResizeObserverCleanup", triggerResizeObserver);
      },
      syncMotionAttribute({ context, scope }) {
        if (!context.get("isViewportRendered")) return;
        dom.setMotionAttr(scope, context.get("value"), context.get("previousValue"));
      },
      focusFirstTabbableEl({ event, scope, context }) {
        (0, import_dom_query.raf)(() => {
          const value = event.value || context.get("value");
          const candidates = dom.getTabbableEls(scope, value);
          const elements = event.side === "start" ? candidates : candidates.reverse();
          if (elements.length) dom.focusFirst(scope, elements);
        });
      },
      focusNextLink({ event, scope }) {
        const activeEl = scope.getActiveElement();
        const linkEls = dom.getLinkEls(scope, event.value);
        if (activeEl == null || !linkEls.includes(activeEl)) return;
        const el = (0, import_dom_query.navigate)(linkEls, activeEl, { key: event.key, loop: false });
        el?.focus();
      },
      focusTrigger({ scope, event, context }) {
        const value = event.value ?? context.get("value");
        dom.getTriggerEl(scope, value)?.focus();
      },
      focusTriggerIfNeeded({ event, scope }) {
        const value = event.value;
        const contentEl = dom.getContentEl(scope, value);
        if (!(0, import_dom_query.contains)(contentEl, scope.getActiveElement())) return;
        dom.getTriggerEl(scope, value)?.focus();
      },
      removeFromTabOrder({ event, scope, refs, context }) {
        const value = event.value ?? context.get("value");
        const candidates = dom.getTabbableEls(scope, value);
        if (candidates.length) refs.set("restoreContentTabOrder", dom.removeFromTabOrder(candidates));
      },
      restoreTabOrder({ refs }) {
        refs.get("restoreContentTabOrder")?.();
      },
      cleanupObservers({ refs }) {
        refs.get("contentResizeObserverCleanup")?.();
        refs.get("contentDismissableCleanup")?.();
        refs.get("triggerResizeObserverCleanup")?.();
        refs.get("restoreContentTabOrder")?.();
        refs.get("contentExitCompleteCleanup")?.();
      },
      checkViewportNode({ context, scope }) {
        context.set("isViewportRendered", !!dom.getViewportEl(scope));
      },
      setViewportPosition({ context, scope }) {
        const triggerNode = context.get("triggerNode");
        const contentNode = context.get("contentNode");
        const rootEl = dom.getRootEl(scope);
        const doc = scope.getDoc();
        const viewportEl = dom.getViewportEl(scope);
        const align = viewportEl?.dataset.align || "center";
        if (contentNode && triggerNode && rootEl) {
          const bodyWidth = doc.documentElement.offsetWidth;
          const bodyHeight = doc.documentElement.offsetHeight;
          const rootRect = rootEl.getBoundingClientRect();
          const triggerRect = triggerNode.getBoundingClientRect();
          const { offsetWidth, offsetHeight } = contentNode;
          const startPositionLeft = triggerRect.left - rootRect.left;
          const startPositionTop = triggerRect.top - rootRect.top;
          let x = null;
          let y = null;
          switch (align) {
            case "start":
              x = startPositionLeft;
              y = startPositionTop;
              break;
            case "end":
              x = startPositionLeft - offsetWidth + triggerRect.width;
              y = startPositionTop - offsetHeight + triggerRect.height;
              break;
            default:
              x = startPositionLeft - offsetWidth / 2 + triggerRect.width / 2;
              y = startPositionTop - offsetHeight / 2 + triggerRect.height / 2;
          }
          const screenOffset = 10;
          if (x + rootRect.left < screenOffset) {
            x = screenOffset - rootRect.left;
          }
          const rightOffset = x + rootRect.left + offsetWidth;
          if (rightOffset > bodyWidth - screenOffset) {
            x -= rightOffset - bodyWidth + screenOffset;
            if (x < screenOffset - rootRect.left) {
              x = screenOffset - rootRect.left;
            }
          }
          if (y + rootRect.top < screenOffset) {
            y = screenOffset - rootRect.top;
          }
          const bottomOffset = y + rootRect.top + offsetHeight;
          if (bottomOffset > bodyHeight - screenOffset) {
            y -= bottomOffset - bodyHeight + screenOffset;
            if (y < screenOffset - rootRect.top) {
              y = screenOffset - rootRect.top;
            }
          }
          x = Math.round(x);
          y = Math.round(y);
          context.set("viewportPosition", { x, y });
        }
      }
    }
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  machine
});
