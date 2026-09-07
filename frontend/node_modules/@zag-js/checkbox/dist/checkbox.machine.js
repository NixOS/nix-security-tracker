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

// src/checkbox.machine.ts
var checkbox_machine_exports = {};
__export(checkbox_machine_exports, {
  machine: () => machine
});
module.exports = __toCommonJS(checkbox_machine_exports);
var import_core = require("@zag-js/core");
var import_dom_query = require("@zag-js/dom-query");
var import_focus_visible = require("@zag-js/focus-visible");
var dom = __toESM(require("./checkbox.dom.js"));
var { not } = (0, import_core.createGuards)();
var machine = (0, import_core.createMachine)({
  props({ props }) {
    return {
      value: "on",
      ...props,
      defaultChecked: props.defaultChecked ?? false
    };
  },
  initialState() {
    return "ready";
  },
  context({ prop, bindable }) {
    return {
      checked: bindable(() => ({
        defaultValue: prop("defaultChecked"),
        value: prop("checked"),
        onChange(checked) {
          prop("onCheckedChange")?.({ checked });
        }
      })),
      fieldsetDisabled: bindable(() => ({ defaultValue: false })),
      focusVisible: bindable(() => ({ defaultValue: false })),
      active: bindable(() => ({ defaultValue: false })),
      focused: bindable(() => ({ defaultValue: false })),
      hovered: bindable(() => ({ defaultValue: false }))
    };
  },
  watch({ track, context, prop, action }) {
    track([() => prop("disabled")], () => {
      action(["removeFocusIfNeeded"]);
    });
    track([() => context.get("checked")], () => {
      action(["syncInputElement"]);
    });
  },
  effects: ["trackFormControlState", "trackPressEvent", "trackFocusVisible"],
  on: {
    "CHECKED.TOGGLE": [
      {
        guard: not("isTrusted"),
        actions: ["toggleChecked", "dispatchChangeEvent"]
      },
      {
        actions: ["toggleChecked"]
      }
    ],
    "CHECKED.SET": [
      {
        guard: not("isTrusted"),
        actions: ["setChecked", "dispatchChangeEvent"]
      },
      {
        actions: ["setChecked"]
      }
    ],
    "CONTEXT.SET": {
      actions: ["setContext"]
    }
  },
  computed: {
    indeterminate: ({ context }) => isIndeterminate(context.get("checked")),
    checked: ({ context }) => isChecked(context.get("checked")),
    disabled: ({ context, prop }) => !!prop("disabled") || context.get("fieldsetDisabled")
  },
  states: {
    ready: {}
  },
  implementations: {
    guards: {
      isTrusted: ({ event }) => !!event.isTrusted
    },
    effects: {
      trackPressEvent({ context, computed, scope }) {
        if (computed("disabled")) return;
        return (0, import_dom_query.trackPress)({
          pointerNode: dom.getRootEl(scope),
          keyboardNode: dom.getHiddenInputEl(scope),
          isValidKey: (event) => event.key === " ",
          onPress: () => context.set("active", false),
          onPressStart: () => context.set("active", true),
          onPressEnd: () => context.set("active", false)
        });
      },
      trackFocusVisible({ computed, scope }) {
        if (computed("disabled")) return;
        return (0, import_focus_visible.trackFocusVisible)({ root: scope.getRootNode?.() });
      },
      trackFormControlState({ context, scope }) {
        return (0, import_dom_query.trackFormControl)(dom.getHiddenInputEl(scope), {
          onFieldsetDisabledChange(disabled) {
            context.set("fieldsetDisabled", disabled);
          },
          onFormReset() {
            context.set("checked", context.initial("checked"));
          }
        });
      }
    },
    actions: {
      setContext({ context, event }) {
        for (const key in event.context) {
          context.set(key, event.context[key]);
        }
      },
      syncInputElement({ context, computed, scope }) {
        const inputEl = dom.getHiddenInputEl(scope);
        if (!inputEl) return;
        (0, import_dom_query.setElementChecked)(inputEl, computed("checked"));
        inputEl.indeterminate = isIndeterminate(context.get("checked"));
      },
      removeFocusIfNeeded({ context, prop }) {
        if (prop("disabled") && context.get("focused")) {
          context.set("focused", false);
          context.set("focusVisible", false);
        }
      },
      setChecked({ context, event }) {
        context.set("checked", event.checked);
      },
      toggleChecked({ context, computed }) {
        const checked = isIndeterminate(computed("checked")) ? true : !computed("checked");
        context.set("checked", checked);
      },
      dispatchChangeEvent({ computed, scope }) {
        queueMicrotask(() => {
          const inputEl = dom.getHiddenInputEl(scope);
          (0, import_dom_query.dispatchInputCheckedEvent)(inputEl, { checked: computed("checked") });
        });
      }
    }
  }
});
function isIndeterminate(checked) {
  return checked === "indeterminate";
}
function isChecked(checked) {
  return isIndeterminate(checked) ? false : !!checked;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  machine
});
