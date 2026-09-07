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

// src/clipboard.machine.ts
var clipboard_machine_exports = {};
__export(clipboard_machine_exports, {
  machine: () => machine
});
module.exports = __toCommonJS(clipboard_machine_exports);
var import_core = require("@zag-js/core");
var import_dom_query = require("@zag-js/dom-query");
var import_utils = require("@zag-js/utils");
var dom = __toESM(require("./clipboard.dom.js"));
var machine = (0, import_core.createMachine)({
  props({ props }) {
    return {
      timeout: 3e3,
      defaultValue: "",
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
      }))
    };
  },
  watch({ track, context, action }) {
    track([() => context.get("value")], () => {
      action(["syncInputElement"]);
    });
  },
  on: {
    "VALUE.SET": {
      actions: ["setValue"]
    },
    COPY: {
      target: "copied",
      actions: ["copyToClipboard", "invokeOnCopy"]
    }
  },
  states: {
    idle: {
      on: {
        "INPUT.COPY": {
          target: "copied",
          actions: ["invokeOnCopy"]
        }
      }
    },
    copied: {
      effects: ["waitForTimeout"],
      on: {
        "COPY.DONE": {
          target: "idle"
        },
        COPY: {
          target: "copied",
          actions: ["copyToClipboard", "invokeOnCopy"]
        },
        "INPUT.COPY": {
          actions: ["invokeOnCopy"]
        }
      }
    }
  },
  implementations: {
    effects: {
      waitForTimeout({ prop, send }) {
        return (0, import_utils.setRafTimeout)(() => {
          send({ type: "COPY.DONE" });
        }, prop("timeout"));
      }
    },
    actions: {
      setValue({ context, event }) {
        context.set("value", event.value);
      },
      copyToClipboard({ context, scope }) {
        dom.writeToClipboard(scope, context.get("value"));
      },
      invokeOnCopy({ prop }) {
        prop("onStatusChange")?.({ copied: true });
      },
      syncInputElement({ context, scope }) {
        const inputEl = dom.getInputEl(scope);
        if (!inputEl) return;
        (0, import_dom_query.setElementValue)(inputEl, context.get("value"));
      }
    }
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  machine
});
