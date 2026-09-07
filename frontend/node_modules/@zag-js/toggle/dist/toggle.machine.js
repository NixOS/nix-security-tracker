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

// src/toggle.machine.ts
var toggle_machine_exports = {};
__export(toggle_machine_exports, {
  machine: () => machine
});
module.exports = __toCommonJS(toggle_machine_exports);
var import_core = require("@zag-js/core");
var machine = (0, import_core.createMachine)({
  props({ props }) {
    return {
      defaultPressed: false,
      ...props
    };
  },
  context({ prop, bindable }) {
    return {
      pressed: bindable(() => ({
        value: prop("pressed"),
        defaultValue: prop("defaultPressed"),
        onChange(value) {
          prop("onPressedChange")?.(value);
        }
      }))
    };
  },
  initialState() {
    return "idle";
  },
  on: {
    "PRESS.TOGGLE": {
      actions: ["togglePressed"]
    },
    "PRESS.SET": {
      actions: ["setPressed"]
    }
  },
  states: {
    idle: {}
  },
  implementations: {
    actions: {
      togglePressed({ context }) {
        context.set("pressed", !context.get("pressed"));
      },
      setPressed({ context, event }) {
        context.set("pressed", event.value);
      }
    }
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  machine
});
