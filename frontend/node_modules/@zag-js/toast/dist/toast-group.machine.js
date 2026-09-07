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

// src/toast-group.machine.ts
var toast_group_machine_exports = {};
__export(toast_group_machine_exports, {
  groupMachine: () => groupMachine
});
module.exports = __toCommonJS(toast_group_machine_exports);
var import_core = require("@zag-js/core");
var import_dismissable = require("@zag-js/dismissable");
var import_dom_query = require("@zag-js/dom-query");
var import_utils = require("@zag-js/utils");
var dom = __toESM(require("./toast.dom.js"));
var { guards, createMachine } = (0, import_core.setup)();
var { and } = guards;
var groupMachine = createMachine({
  props({ props }) {
    return {
      dir: "ltr",
      id: (0, import_utils.uuid)(),
      ...props,
      store: props.store
    };
  },
  initialState({ prop }) {
    return prop("store").attrs.overlap ? "overlap" : "stack";
  },
  refs() {
    return {
      lastFocusedEl: null,
      isFocusWithin: false,
      isPointerWithin: false,
      ignoreMouseTimer: import_dom_query.AnimationFrame.create(),
      dismissableCleanup: void 0
    };
  },
  context({ bindable }) {
    return {
      toasts: bindable(() => ({
        defaultValue: [],
        sync: true,
        hash: (toasts) => toasts.map((t) => t.id).join(",")
      })),
      heights: bindable(() => ({
        defaultValue: [],
        sync: true
      }))
    };
  },
  computed: {
    count: ({ context }) => context.get("toasts").length,
    overlap: ({ prop }) => prop("store").attrs.overlap,
    placement: ({ prop }) => prop("store").attrs.placement
  },
  effects: ["subscribeToStore", "trackDocumentVisibility", "trackHotKeyPress"],
  watch({ track, context, action }) {
    track([() => context.hash("toasts")], () => {
      queueMicrotask(() => {
        action(["collapsedIfEmpty", "setDismissableBranch"]);
      });
    });
  },
  exit: ["clearDismissableBranch", "clearLastFocusedEl", "clearMouseEventTimer"],
  on: {
    "DOC.HOTKEY": {
      actions: ["focusRegionEl"]
    },
    "REGION.BLUR": [
      {
        guard: and("isOverlapping", "isPointerOut"),
        target: "overlap",
        actions: ["collapseToasts", "resumeToasts", "restoreFocusIfPointerOut"]
      },
      {
        guard: "isPointerOut",
        target: "stack",
        actions: ["resumeToasts", "restoreFocusIfPointerOut"]
      },
      {
        actions: ["clearFocusWithin"]
      }
    ],
    "TOAST.REMOVE": {
      actions: ["removeToast", "removeHeight", "ignoreMouseEventsTemporarily"]
    },
    "TOAST.PAUSE": {
      actions: ["pauseToasts"]
    }
  },
  states: {
    stack: {
      on: {
        "REGION.POINTER_LEAVE": [
          {
            guard: "isOverlapping",
            target: "overlap",
            actions: ["clearPointerWithin", "resumeToasts", "collapseToasts"]
          },
          {
            actions: ["clearPointerWithin", "resumeToasts"]
          }
        ],
        "REGION.OVERLAP": {
          target: "overlap",
          actions: ["collapseToasts"]
        },
        "REGION.FOCUS": {
          actions: ["setLastFocusedEl", "pauseToasts"]
        },
        "REGION.POINTER_ENTER": {
          actions: ["setPointerWithin", "pauseToasts"]
        }
      }
    },
    overlap: {
      on: {
        "REGION.STACK": {
          target: "stack",
          actions: ["expandToasts"]
        },
        "REGION.POINTER_ENTER": {
          target: "stack",
          actions: ["setPointerWithin", "pauseToasts", "expandToasts"]
        },
        "REGION.FOCUS": {
          target: "stack",
          actions: ["setLastFocusedEl", "pauseToasts", "expandToasts"]
        }
      }
    }
  },
  implementations: {
    guards: {
      isOverlapping: ({ computed }) => computed("overlap"),
      isPointerOut: ({ refs }) => !refs.get("isPointerWithin")
    },
    effects: {
      subscribeToStore({ context, prop }) {
        const store = prop("store");
        context.set("toasts", store.getVisibleToasts());
        return store.subscribe((toast) => {
          if (toast.dismiss) {
            context.set("toasts", (prev) => prev.filter((t) => t.id !== toast.id));
            return;
          }
          context.set("toasts", (prev) => {
            const index = prev.findIndex((t) => t.id === toast.id);
            if (index !== -1) {
              return [...prev.slice(0, index), { ...prev[index], ...toast }, ...prev.slice(index + 1)];
            }
            return [toast, ...prev];
          });
        });
      },
      trackHotKeyPress({ prop, send }) {
        const handleKeyDown = (event) => {
          const { hotkey } = prop("store").attrs;
          const isHotkeyPressed = hotkey.every((key) => event[key] || event.code === key);
          if (!isHotkeyPressed) return;
          send({ type: "DOC.HOTKEY" });
        };
        return (0, import_dom_query.addDomEvent)(document, "keydown", handleKeyDown, { capture: true });
      },
      trackDocumentVisibility({ prop, send, scope }) {
        const { pauseOnPageIdle } = prop("store").attrs;
        if (!pauseOnPageIdle) return;
        const doc = scope.getDoc();
        return (0, import_dom_query.addDomEvent)(doc, "visibilitychange", () => {
          const isHidden = doc.visibilityState === "hidden";
          send({ type: isHidden ? "PAUSE_ALL" : "RESUME_ALL" });
        });
      }
    },
    actions: {
      setDismissableBranch({ refs, context, computed, scope }) {
        const toasts = context.get("toasts");
        const placement = computed("placement");
        const hasToasts = toasts.length > 0;
        if (!hasToasts) {
          refs.get("dismissableCleanup")?.();
          return;
        }
        if (hasToasts && refs.get("dismissableCleanup")) {
          return;
        }
        const groupEl = () => dom.getRegionEl(scope, placement);
        const cleanup = (0, import_dismissable.trackDismissableBranch)(groupEl, { defer: true });
        refs.set("dismissableCleanup", cleanup);
      },
      clearDismissableBranch({ refs }) {
        refs.get("dismissableCleanup")?.();
      },
      focusRegionEl({ scope, computed }) {
        queueMicrotask(() => {
          dom.getRegionEl(scope, computed("placement"))?.focus();
        });
      },
      pauseToasts({ prop }) {
        prop("store").pause();
      },
      resumeToasts({ prop }) {
        prop("store").resume();
      },
      expandToasts({ prop }) {
        prop("store").expand();
      },
      collapseToasts({ prop }) {
        prop("store").collapse();
      },
      removeToast({ prop, event }) {
        prop("store").remove(event.id);
      },
      removeHeight({ event, context }) {
        if (event?.id == null) return;
        queueMicrotask(() => {
          context.set("heights", (heights) => heights.filter((height) => height.id !== event.id));
        });
      },
      collapsedIfEmpty({ send, computed }) {
        if (!computed("overlap") || computed("count") > 1) return;
        send({ type: "REGION.OVERLAP" });
      },
      setLastFocusedEl({ refs, event }) {
        if (refs.get("isFocusWithin") || !event.target) return;
        refs.set("isFocusWithin", true);
        refs.set("lastFocusedEl", event.target);
      },
      restoreFocusIfPointerOut({ refs }) {
        if (!refs.get("lastFocusedEl") || refs.get("isPointerWithin")) return;
        refs.get("lastFocusedEl")?.focus({ preventScroll: true });
        refs.set("lastFocusedEl", null);
        refs.set("isFocusWithin", false);
      },
      setPointerWithin({ refs }) {
        refs.set("isPointerWithin", true);
      },
      clearPointerWithin({ refs }) {
        refs.set("isPointerWithin", false);
        if (refs.get("lastFocusedEl") && !refs.get("isFocusWithin")) {
          refs.get("lastFocusedEl")?.focus({ preventScroll: true });
          refs.set("lastFocusedEl", null);
        }
      },
      clearFocusWithin({ refs }) {
        refs.set("isFocusWithin", false);
      },
      clearLastFocusedEl({ refs }) {
        if (!refs.get("lastFocusedEl")) return;
        refs.get("lastFocusedEl")?.focus({ preventScroll: true });
        refs.set("lastFocusedEl", null);
        refs.set("isFocusWithin", false);
      },
      ignoreMouseEventsTemporarily({ refs }) {
        refs.get("ignoreMouseTimer").request();
      },
      clearMouseEventTimer({ refs }) {
        refs.get("ignoreMouseTimer").cancel();
      }
    }
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  groupMachine
});
