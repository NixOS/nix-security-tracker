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

// src/angle-slider.machine.ts
var angle_slider_machine_exports = {};
__export(angle_slider_machine_exports, {
  machine: () => machine
});
module.exports = __toCommonJS(angle_slider_machine_exports);
var import_dom_query = require("@zag-js/dom-query");
var import_core = require("@zag-js/core");
var dom = __toESM(require("./angle-slider.dom.js"));
var import_angle_slider = require("./angle-slider.utils.js");
var machine = (0, import_core.createMachine)({
  props({ props }) {
    return {
      step: 1,
      defaultValue: 0,
      ...props
    };
  },
  context({ prop, bindable }) {
    return {
      value: bindable(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        onChange(value) {
          prop("onValueChange")?.({ value, valueAsDegree: `${value}deg` });
        }
      }))
    };
  },
  refs() {
    return {
      thumbDragOffset: null
    };
  },
  computed: {
    interactive: ({ prop }) => !(prop("disabled") || prop("readOnly")),
    valueAsDegree: ({ context }) => `${context.get("value")}deg`
  },
  watch({ track, context, action }) {
    track([() => context.get("value")], () => {
      action(["syncInputElement"]);
    });
  },
  initialState() {
    return "idle";
  },
  on: {
    "VALUE.SET": {
      actions: ["setValue"]
    }
  },
  states: {
    idle: {
      on: {
        "CONTROL.POINTER_DOWN": {
          target: "dragging",
          actions: ["setThumbDragOffset", "setPointerValue", "focusThumb"]
        },
        "THUMB.FOCUS": {
          target: "focused"
        }
      }
    },
    focused: {
      on: {
        "CONTROL.POINTER_DOWN": {
          target: "dragging",
          actions: ["setThumbDragOffset", "setPointerValue", "focusThumb"]
        },
        "THUMB.ARROW_DEC": {
          actions: ["decrementValue", "invokeOnChangeEnd"]
        },
        "THUMB.ARROW_INC": {
          actions: ["incrementValue", "invokeOnChangeEnd"]
        },
        "THUMB.HOME": {
          actions: ["setValueToMin", "invokeOnChangeEnd"]
        },
        "THUMB.END": {
          actions: ["setValueToMax", "invokeOnChangeEnd"]
        },
        "THUMB.BLUR": {
          target: "idle"
        }
      }
    },
    dragging: {
      entry: ["focusThumb"],
      effects: ["trackPointerMove"],
      on: {
        "DOC.POINTER_UP": {
          target: "focused",
          actions: ["invokeOnChangeEnd", "clearThumbDragOffset"]
        },
        "DOC.POINTER_MOVE": {
          actions: ["setPointerValue"]
        }
      }
    }
  },
  implementations: {
    effects: {
      trackPointerMove({ scope, send }) {
        return (0, import_dom_query.trackPointerMove)(scope.getDoc(), {
          onPointerMove(info) {
            send({ type: "DOC.POINTER_MOVE", point: info.point });
          },
          onPointerUp() {
            send({ type: "DOC.POINTER_UP" });
          }
        });
      }
    },
    actions: {
      syncInputElement({ scope, context }) {
        const inputEl = dom.getHiddenInputEl(scope);
        (0, import_dom_query.setElementValue)(inputEl, context.get("value").toString());
      },
      invokeOnChangeEnd({ context, prop, computed }) {
        prop("onValueChangeEnd")?.({
          value: context.get("value"),
          valueAsDegree: computed("valueAsDegree")
        });
      },
      setPointerValue({ scope, event, context, prop, refs }) {
        const controlEl = dom.getControlEl(scope);
        if (!controlEl) return;
        const angularOffset = refs.get("thumbDragOffset");
        const value = context.get("value");
        const deg = (0, import_angle_slider.getPointerValue)(controlEl, event.point, angularOffset, value, prop("dir"));
        context.set("value", (0, import_angle_slider.constrainAngle)(deg, prop("step")));
      },
      setValueToMin({ context }) {
        context.set("value", import_angle_slider.MIN_VALUE);
      },
      setValueToMax({ context }) {
        context.set("value", import_angle_slider.MAX_VALUE);
      },
      setValue({ context, event }) {
        context.set("value", (0, import_angle_slider.clampAngle)(event.value));
      },
      decrementValue({ context, event, prop }) {
        const value = (0, import_angle_slider.snapAngleToStep)(context.get("value") - event.step, event.step ?? prop("step"));
        context.set("value", value);
      },
      incrementValue({ context, event, prop }) {
        const value = (0, import_angle_slider.snapAngleToStep)(context.get("value") + event.step, event.step ?? prop("step"));
        context.set("value", value);
      },
      focusThumb({ scope }) {
        (0, import_dom_query.raf)(() => {
          dom.getThumbEl(scope)?.focus({ preventScroll: true });
        });
      },
      setThumbDragOffset({ refs, event }) {
        refs.set("thumbDragOffset", event.angularOffset ?? null);
      },
      clearThumbDragOffset({ refs }) {
        refs.set("thumbDragOffset", null);
      }
    }
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  machine
});
