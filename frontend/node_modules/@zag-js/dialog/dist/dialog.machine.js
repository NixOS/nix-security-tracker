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

// src/dialog.machine.ts
var dialog_machine_exports = {};
__export(dialog_machine_exports, {
  machine: () => machine
});
module.exports = __toCommonJS(dialog_machine_exports);
var import_aria_hidden = require("@zag-js/aria-hidden");
var import_core = require("@zag-js/core");
var import_dismissable = require("@zag-js/dismissable");
var import_dom_query = require("@zag-js/dom-query");
var import_focus_trap = require("@zag-js/focus-trap");
var import_remove_scroll = require("@zag-js/remove-scroll");
var dom = __toESM(require("./dialog.dom.js"));
var machine = (0, import_core.createMachine)({
  props({ props, scope }) {
    const alertDialog = props.role === "alertdialog";
    const initialFocusEl = alertDialog ? () => dom.getCloseTriggerEl(scope) : void 0;
    const modal = typeof props.modal === "boolean" ? props.modal : true;
    return {
      role: "dialog",
      modal,
      trapFocus: modal,
      preventScroll: modal,
      closeOnInteractOutside: modal && !alertDialog,
      closeOnEscape: true,
      restoreFocus: true,
      initialFocusEl,
      ...props
    };
  },
  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen");
    return open ? "open" : "closed";
  },
  context({ bindable, prop, scope }) {
    return {
      rendered: bindable(() => ({
        defaultValue: { title: true, description: true }
      })),
      triggerValue: bindable(() => ({
        defaultValue: prop("defaultTriggerValue") ?? null,
        value: prop("triggerValue"),
        onChange(value) {
          const onTriggerValueChange = prop("onTriggerValueChange");
          if (!onTriggerValueChange) return;
          const triggerElement = dom.getActiveTriggerEl(scope, value);
          onTriggerValueChange({ value, triggerElement });
        }
      }))
    };
  },
  watch({ track, action, prop }) {
    track([() => prop("open")], () => {
      action(["toggleVisibility"]);
    });
  },
  states: {
    open: {
      entry: ["checkRenderedElements", "setInitialFocus"],
      effects: ["trackDismissableElement", "trapFocus", "preventScroll", "hideContentBelow"],
      on: {
        "CONTROLLED.CLOSE": {
          target: "closed"
        },
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"]
          },
          {
            target: "closed",
            actions: ["invokeOnClose"]
          }
        ],
        TOGGLE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"]
          },
          {
            target: "closed",
            actions: ["invokeOnClose"]
          }
        ],
        "TRIGGER_VALUE.SET": {
          actions: ["setTriggerValue"]
        }
      }
    },
    closed: {
      on: {
        "CONTROLLED.OPEN": {
          target: "open"
        },
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen", "setTriggerValue"]
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "setTriggerValue"]
          }
        ],
        TOGGLE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen", "setTriggerValue"]
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "setTriggerValue"]
          }
        ],
        "TRIGGER_VALUE.SET": {
          actions: ["setTriggerValue"]
        }
      }
    }
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop("open") != void 0
    },
    effects: {
      trackDismissableElement({ scope, send, prop }) {
        const getContentEl2 = () => dom.getContentEl(scope);
        return (0, import_dismissable.trackDismissableElement)(getContentEl2, {
          type: "dialog",
          defer: true,
          pointerBlocking: prop("modal"),
          layerStyleTargets: [() => dom.getBackdropEl(scope), () => dom.getPositionerEl(scope)],
          exclude: [dom.getTriggerEl(scope), ...dom.getTriggerEls(scope)].filter(Boolean),
          onInteractOutside(event) {
            prop("onInteractOutside")?.(event);
            if (!prop("closeOnInteractOutside")) {
              event.preventDefault();
            }
          },
          persistentElements: prop("persistentElements"),
          onFocusOutside: prop("onFocusOutside"),
          onPointerDownOutside: prop("onPointerDownOutside"),
          onRequestDismiss: prop("onRequestDismiss"),
          onEscapeKeyDown(event) {
            prop("onEscapeKeyDown")?.(event);
            if (!prop("closeOnEscape")) {
              event.preventDefault();
            }
          },
          onDismiss() {
            send({ type: "CLOSE", src: "interact-outside" });
          }
        });
      },
      preventScroll({ scope, prop }) {
        if (!prop("preventScroll")) return;
        return (0, import_remove_scroll.preventBodyScroll)(scope.getDoc());
      },
      trapFocus({ scope, prop, context }) {
        if (!prop("trapFocus")) return;
        const contentEl = () => dom.getContentEl(scope);
        return (0, import_focus_trap.trapFocus)(contentEl, {
          preventScroll: true,
          returnFocusOnDeactivate: !!prop("restoreFocus"),
          initialFocus: () => (0, import_dom_query.getInitialFocus)({
            root: dom.getContentEl(scope),
            getInitialEl: prop("initialFocusEl")
          }),
          setReturnFocus: (el) => {
            const finalFocusEl = prop("finalFocusEl")?.();
            if (finalFocusEl) return finalFocusEl;
            const triggerValue = context.get("triggerValue");
            if (triggerValue) {
              const activeTriggerEl = dom.getActiveTriggerEl(scope, triggerValue);
              if (activeTriggerEl) return activeTriggerEl;
            }
            const fallbackTrigger = dom.getTriggerEls(scope)[0];
            if (fallbackTrigger) return fallbackTrigger;
            return el;
          },
          getShadowRoot: true
        });
      },
      hideContentBelow({ scope, prop }) {
        if (!prop("modal")) return;
        const getElements = () => [dom.getContentEl(scope)];
        return (0, import_aria_hidden.ariaHidden)(getElements, { defer: true });
      }
    },
    actions: {
      setInitialFocus({ prop, scope }) {
        if (prop("trapFocus")) return;
        (0, import_dom_query.raf)(() => {
          const element = (0, import_dom_query.getInitialFocus)({
            root: dom.getContentEl(scope),
            getInitialEl: prop("initialFocusEl")
          });
          element?.focus({ preventScroll: true });
        });
      },
      checkRenderedElements({ context, scope }) {
        (0, import_dom_query.raf)(() => {
          context.set("rendered", {
            title: !!dom.getTitleEl(scope),
            description: !!dom.getDescriptionEl(scope)
          });
        });
      },
      invokeOnClose({ prop }) {
        prop("onOpenChange")?.({ open: false });
      },
      invokeOnOpen({ prop }) {
        prop("onOpenChange")?.({ open: true });
      },
      setTriggerValue({ context, event }) {
        if (event.value === void 0) return;
        context.set("triggerValue", event.value);
      },
      toggleVisibility({ prop, send, event }) {
        send({
          type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
          previousEvent: event
        });
      }
    }
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  machine
});
