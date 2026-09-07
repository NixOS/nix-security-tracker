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

// src/toggle-group.machine.ts
var toggle_group_machine_exports = {};
__export(toggle_group_machine_exports, {
  machine: () => machine
});
module.exports = __toCommonJS(toggle_group_machine_exports);
var import_core = require("@zag-js/core");
var import_dom_query = require("@zag-js/dom-query");
var import_utils = require("@zag-js/utils");
var dom = __toESM(require("./toggle-group.dom.js"));
var { not, and } = (0, import_core.createGuards)();
var machine = (0, import_core.createMachine)({
  props({ props }) {
    return {
      defaultValue: [],
      orientation: "horizontal",
      rovingFocus: true,
      loopFocus: true,
      deselectable: true,
      ...props
    };
  },
  initialState() {
    return "idle";
  },
  context({ prop, bindable }) {
    return {
      value: bindable(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        onChange(value) {
          prop("onValueChange")?.({ value });
        }
      })),
      focusedId: bindable(() => ({
        defaultValue: null
      })),
      isTabbingBackward: bindable(() => ({
        defaultValue: false
      })),
      isClickFocus: bindable(() => ({
        defaultValue: false
      })),
      isWithinToolbar: bindable(() => ({
        defaultValue: false
      }))
    };
  },
  computed: {
    currentLoopFocus: ({ context, prop }) => prop("loopFocus") && !context.get("isWithinToolbar")
  },
  entry: ["checkIfWithinToolbar"],
  on: {
    "VALUE.SET": {
      actions: ["setValue"]
    },
    "TOGGLE.CLICK": {
      actions: ["setValue"]
    },
    "ROOT.MOUSE_DOWN": {
      actions: ["setClickFocus"]
    }
  },
  states: {
    idle: {
      on: {
        "ROOT.FOCUS": {
          target: "focused",
          guard: not(and("isClickFocus", "isTabbingBackward")),
          actions: ["focusFirstToggle", "clearClickFocus"]
        },
        "TOGGLE.FOCUS": {
          target: "focused",
          actions: ["setFocusedId"]
        }
      }
    },
    focused: {
      on: {
        "ROOT.BLUR": {
          target: "idle",
          actions: ["clearIsTabbingBackward", "clearFocusedId", "clearClickFocus"]
        },
        "TOGGLE.FOCUS": {
          actions: ["setFocusedId"]
        },
        "TOGGLE.FOCUS_NEXT": {
          actions: ["focusNextToggle"]
        },
        "TOGGLE.FOCUS_PREV": {
          actions: ["focusPrevToggle"]
        },
        "TOGGLE.FOCUS_FIRST": {
          actions: ["focusFirstToggle"]
        },
        "TOGGLE.FOCUS_LAST": {
          actions: ["focusLastToggle"]
        },
        "TOGGLE.SHIFT_TAB": [
          {
            guard: not("isFirstToggleFocused"),
            target: "idle",
            actions: ["setIsTabbingBackward"]
          },
          {
            actions: ["setIsTabbingBackward"]
          }
        ]
      }
    }
  },
  implementations: {
    guards: {
      isClickFocus: ({ context }) => context.get("isClickFocus"),
      isTabbingBackward: ({ context }) => context.get("isTabbingBackward"),
      isFirstToggleFocused: ({ context, scope }) => context.get("focusedId") === dom.getFirstEl(scope)?.id
    },
    actions: {
      setIsTabbingBackward({ context }) {
        context.set("isTabbingBackward", true);
      },
      clearIsTabbingBackward({ context }) {
        context.set("isTabbingBackward", false);
      },
      setClickFocus({ context }) {
        context.set("isClickFocus", true);
      },
      clearClickFocus({ context }) {
        context.set("isClickFocus", false);
      },
      checkIfWithinToolbar({ context, scope }) {
        const closestToolbar = dom.getRootEl(scope)?.closest("[role=toolbar]");
        context.set("isWithinToolbar", !!closestToolbar);
      },
      setFocusedId({ context, event }) {
        context.set("focusedId", event.id);
      },
      clearFocusedId({ context }) {
        context.set("focusedId", null);
      },
      setValue({ context, event, prop }) {
        (0, import_utils.ensureProps)(event, ["value"]);
        let next = context.get("value");
        if ((0, import_utils.isArray)(event.value)) {
          next = event.value;
        } else if (prop("multiple")) {
          next = (0, import_utils.addOrRemove)(next, event.value);
        } else {
          const isSelected = (0, import_utils.isEqual)(next, [event.value]);
          next = isSelected && prop("deselectable") ? [] : [event.value];
        }
        context.set("value", next);
      },
      focusNextToggle({ context, scope, prop }) {
        (0, import_dom_query.raf)(() => {
          const focusedId = context.get("focusedId");
          if (!focusedId) return;
          dom.getNextEl(scope, focusedId, prop("loopFocus"))?.focus({ preventScroll: true });
        });
      },
      focusPrevToggle({ context, scope, prop }) {
        (0, import_dom_query.raf)(() => {
          const focusedId = context.get("focusedId");
          if (!focusedId) return;
          dom.getPrevEl(scope, focusedId, prop("loopFocus"))?.focus({ preventScroll: true });
        });
      },
      focusFirstToggle({ scope }) {
        (0, import_dom_query.raf)(() => {
          dom.getFirstEl(scope)?.focus({ preventScroll: true });
        });
      },
      focusLastToggle({ scope }) {
        (0, import_dom_query.raf)(() => {
          dom.getLastEl(scope)?.focus({ preventScroll: true });
        });
      }
    }
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  machine
});
