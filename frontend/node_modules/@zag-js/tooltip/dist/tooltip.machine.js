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

// src/tooltip.machine.ts
var tooltip_machine_exports = {};
__export(tooltip_machine_exports, {
  machine: () => machine
});
module.exports = __toCommonJS(tooltip_machine_exports);
var import_core = require("@zag-js/core");
var import_dom_query = require("@zag-js/dom-query");
var import_focus_visible = require("@zag-js/focus-visible");
var import_popper = require("@zag-js/popper");
var import_utils = require("@zag-js/utils");
var dom = __toESM(require("./tooltip.dom.js"));
var import_tooltip = require("./tooltip.store.js");
var { and, not } = (0, import_core.createGuards)();
var machine = (0, import_core.createMachine)({
  initialState: ({ prop }) => {
    const open = prop("open") || prop("defaultOpen");
    return open ? "open" : "closed";
  },
  props({ props }) {
    (0, import_utils.ensureProps)(props, ["id"]);
    const closeOnClick = props.closeOnClick ?? true;
    const closeOnPointerDown = props.closeOnPointerDown ?? closeOnClick;
    return {
      openDelay: 400,
      closeDelay: 150,
      closeOnEscape: true,
      interactive: false,
      closeOnScroll: true,
      disabled: false,
      ...props,
      closeOnPointerDown,
      closeOnClick,
      positioning: {
        placement: "bottom",
        ...props.positioning
      }
    };
  },
  effects: ["trackFocusVisible", "trackStore"],
  context: ({ bindable, prop, scope }) => ({
    currentPlacement: bindable(() => ({ defaultValue: void 0 })),
    hasPointerMoveOpened: bindable(() => ({ defaultValue: null })),
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
  }),
  watch({ track, action, prop }) {
    track([() => prop("disabled")], () => {
      action(["closeIfDisabled"]);
    });
    track([() => prop("open")], () => {
      action(["toggleVisibility"]);
    });
    track([() => prop("triggerValue")], () => {
      action(["repositionImmediate"]);
    });
  },
  on: {
    "triggerValue.set": {
      actions: ["setTriggerValue", "repositionImmediate"]
    }
  },
  states: {
    closed: {
      entry: ["clearGlobalId"],
      on: {
        "controlled.open": {
          target: "open"
        },
        open: [
          {
            guard: "isOpenControlled",
            actions: ["setTriggerValue", "invokeOnOpen"]
          },
          {
            target: "open",
            actions: ["setTriggerValue", "invokeOnOpen"]
          }
        ],
        "pointer.leave": {
          actions: ["clearPointerMoveOpened"]
        },
        "pointer.move": [
          {
            guard: and("noVisibleTooltip", not("hasPointerMoveOpened")),
            target: "opening",
            actions: ["setTriggerValue"]
          },
          {
            guard: not("hasPointerMoveOpened"),
            target: "open",
            actions: ["setPointerMoveOpened", "invokeOnOpen", "setTriggerValue"]
          }
        ]
      }
    },
    opening: {
      effects: ["trackScroll", "trackPointerlockChange", "waitForOpenDelay"],
      on: {
        "after.openDelay": [
          {
            guard: "isOpenControlled",
            actions: ["setPointerMoveOpened", "invokeOnOpen"]
          },
          {
            target: "open",
            actions: ["setPointerMoveOpened", "invokeOnOpen"]
          }
        ],
        "controlled.open": {
          target: "open"
        },
        "controlled.close": {
          target: "closed"
        },
        open: [
          {
            guard: "isOpenControlled",
            actions: ["setTriggerValue", "invokeOnOpen"]
          },
          {
            target: "open",
            actions: ["setTriggerValue", "invokeOnOpen"]
          }
        ],
        "pointer.leave": [
          {
            guard: "isOpenControlled",
            // We trigger toggleVisibility manually since the `ctx.open` has not changed yet (at this point)
            actions: ["clearPointerMoveOpened", "invokeOnClose", "toggleVisibility"]
          },
          {
            target: "closed",
            actions: ["clearPointerMoveOpened", "invokeOnClose"]
          }
        ],
        close: [
          {
            guard: "isOpenControlled",
            // We trigger toggleVisibility manually since the `ctx.open` has not changed yet (at this point)
            actions: ["invokeOnClose", "toggleVisibility"]
          },
          {
            target: "closed",
            actions: ["invokeOnClose"]
          }
        ]
      }
    },
    open: {
      effects: ["trackEscapeKey", "trackScroll", "trackPointerlockChange", "trackPositioning"],
      entry: ["setGlobalId"],
      on: {
        "controlled.close": {
          target: "closed"
        },
        close: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"]
          },
          {
            target: "closed",
            actions: ["invokeOnClose"]
          }
        ],
        "pointer.leave": [
          {
            guard: "isVisible",
            target: "closing",
            actions: ["clearPointerMoveOpened"]
          },
          // == group ==
          {
            guard: "isOpenControlled",
            actions: ["clearPointerMoveOpened", "invokeOnClose"]
          },
          {
            target: "closed",
            actions: ["clearPointerMoveOpened", "invokeOnClose"]
          }
        ],
        "content.pointer.leave": {
          guard: "isInteractive",
          target: "closing"
        },
        "positioning.set": {
          actions: ["reposition"]
        },
        "triggerValue.set": {
          // Transition to closing (which cleans up trackPositioning) then immediately back to open
          // This re-creates the positioning effect with the new trigger
          target: "closing",
          actions: ["setTriggerValue", "immediateReopen"]
        }
      }
    },
    closing: {
      effects: ["trackPositioning", "waitForCloseDelay"],
      on: {
        "after.closeDelay": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"]
          },
          {
            target: "closed",
            actions: ["invokeOnClose"]
          }
        ],
        "controlled.close": {
          target: "closed"
        },
        "controlled.open": {
          target: "open"
        },
        close: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"]
          },
          {
            target: "closed",
            actions: ["invokeOnClose"]
          }
        ],
        "pointer.move": [
          {
            guard: "isOpenControlled",
            // We trigger toggleVisibility manually since the `ctx.open` has not changed yet (at this point)
            actions: ["setPointerMoveOpened", "setTriggerValue", "invokeOnOpen", "toggleVisibility"]
          },
          {
            target: "open",
            actions: ["setPointerMoveOpened", "setTriggerValue", "invokeOnOpen"]
          }
        ],
        "triggerValue.set": {
          target: "open",
          actions: ["setTriggerValue", "repositionImmediate"]
        },
        reopen: {
          target: "open"
        },
        "content.pointer.move": {
          guard: "isInteractive",
          target: "open"
        },
        "positioning.set": {
          actions: ["reposition"]
        }
      }
    }
  },
  implementations: {
    guards: {
      noVisibleTooltip: () => import_tooltip.store.get("id") === null,
      isVisible: ({ prop }) => prop("id") === import_tooltip.store.get("id"),
      isInteractive: ({ prop }) => !!prop("interactive"),
      hasPointerMoveOpened: ({ context }) => !!context.get("hasPointerMoveOpened"),
      isOpenControlled: ({ prop }) => prop("open") !== void 0
    },
    actions: {
      setGlobalId: ({ prop }) => {
        const prevId = import_tooltip.store.get("id");
        const isInstant = prevId !== null && prevId !== prop("id");
        import_tooltip.store.update({ id: prop("id"), prevId: isInstant ? prevId : null, instant: isInstant });
      },
      clearGlobalId: ({ prop }) => {
        if (prop("id") === import_tooltip.store.get("id")) {
          import_tooltip.store.update({ id: null, prevId: null, instant: false });
        }
      },
      invokeOnOpen: ({ prop }) => {
        prop("onOpenChange")?.({ open: true });
      },
      invokeOnClose: ({ prop }) => {
        prop("onOpenChange")?.({ open: false });
      },
      closeIfDisabled: ({ prop, send }) => {
        if (!prop("disabled")) return;
        send({ type: "close", src: "disabled.change" });
      },
      reposition: ({ context, event, prop, scope }) => {
        if (event.type !== "positioning.set") return;
        const getPositionerEl2 = () => dom.getPositionerEl(scope);
        const getTriggerEl = () => dom.getActiveTriggerEl(scope, context.get("triggerValue"));
        (0, import_popper.getPlacement)(getTriggerEl, getPositionerEl2, {
          ...prop("positioning"),
          ...event.options,
          listeners: false,
          onComplete(data) {
            context.set("currentPlacement", data.placement);
          }
        });
      },
      repositionImmediate: ({ context, event, prop, scope }) => {
        const triggerValue = event.value ?? context.get("triggerValue");
        const getPositionerEl2 = () => dom.getPositionerEl(scope);
        const getTriggerEl = () => dom.getActiveTriggerEl(scope, triggerValue);
        return (0, import_popper.getPlacement)(getTriggerEl, getPositionerEl2, {
          ...prop("positioning"),
          onComplete(data) {
            context.set("currentPlacement", data.placement);
          }
        });
      },
      toggleVisibility: ({ prop, event, send }) => {
        queueMicrotask(() => {
          send({
            type: prop("open") ? "controlled.open" : "controlled.close",
            previousEvent: event
          });
        });
      },
      setPointerMoveOpened: ({ context, event }) => {
        const triggerId = event.triggerId ?? event.previousEvent?.triggerId;
        context.set("hasPointerMoveOpened", triggerId ?? null);
      },
      clearPointerMoveOpened: ({ context }) => {
        context.set("hasPointerMoveOpened", null);
      },
      setTriggerValue: ({ context, event }) => {
        if (event.value === void 0) return;
        context.set("triggerValue", event.value);
      },
      immediateReopen: ({ send }) => {
        queueMicrotask(() => {
          send({ type: "reopen" });
        });
      }
    },
    effects: {
      trackFocusVisible: ({ scope }) => {
        return (0, import_focus_visible.trackFocusVisible)({ root: scope.getRootNode?.() });
      },
      trackPositioning: ({ context, prop, scope }) => {
        if (!context.get("currentPlacement")) {
          context.set("currentPlacement", prop("positioning").placement);
        }
        const getPositionerEl2 = () => dom.getPositionerEl(scope);
        const getTriggerEl = () => dom.getActiveTriggerEl(scope, context.get("triggerValue"));
        return (0, import_popper.getPlacement)(getTriggerEl, getPositionerEl2, {
          ...prop("positioning"),
          defer: true,
          onComplete(data) {
            context.set("currentPlacement", data.placement);
          }
        });
      },
      trackPointerlockChange: ({ send, scope }) => {
        const doc = scope.getDoc();
        const onChange = () => send({ type: "close", src: "pointerlock:change" });
        return (0, import_dom_query.addDomEvent)(doc, "pointerlockchange", onChange, false);
      },
      trackScroll: ({ send, prop, scope, context }) => {
        if (!prop("closeOnScroll")) return;
        const triggerValue = context.get("triggerValue");
        const triggerEl = dom.getActiveTriggerEl(scope, triggerValue);
        if (!triggerEl) return;
        const overflowParents = (0, import_dom_query.getOverflowAncestors)(triggerEl);
        const cleanups = overflowParents.map((overflowParent) => {
          const onScroll = () => {
            send({ type: "close", src: "scroll" });
          };
          return (0, import_dom_query.addDomEvent)(overflowParent, "scroll", onScroll, {
            passive: true,
            capture: true
          });
        });
        return () => {
          cleanups.forEach((fn) => fn?.());
        };
      },
      trackStore: ({ prop, send }) => {
        let cleanup;
        queueMicrotask(() => {
          cleanup = import_tooltip.store.subscribe(() => {
            if (import_tooltip.store.get("id") !== prop("id")) {
              send({ type: "close", src: "id.change" });
            }
          });
        });
        return () => cleanup?.();
      },
      trackEscapeKey: ({ send, prop }) => {
        if (!prop("closeOnEscape")) return;
        const onKeyDown = (event) => {
          if ((0, import_dom_query.isComposingEvent)(event)) return;
          if (event.key !== "Escape") return;
          event.stopPropagation();
          send({ type: "close", src: "keydown.escape" });
        };
        return (0, import_dom_query.addDomEvent)(document, "keydown", onKeyDown, true);
      },
      waitForOpenDelay: ({ send, prop, event }) => {
        const id = setTimeout(() => {
          send({ type: "after.openDelay", previousEvent: event });
        }, prop("openDelay"));
        return () => clearTimeout(id);
      },
      waitForCloseDelay: ({ send, prop, event }) => {
        const id = setTimeout(() => {
          send({ type: "after.closeDelay", previousEvent: event });
        }, prop("closeDelay"));
        return () => clearTimeout(id);
      }
    }
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  machine
});
