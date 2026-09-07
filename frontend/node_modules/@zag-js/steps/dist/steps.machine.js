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

// src/steps.machine.ts
var steps_machine_exports = {};
__export(steps_machine_exports, {
  machine: () => machine
});
module.exports = __toCommonJS(steps_machine_exports);
var import_core = require("@zag-js/core");
var import_utils = require("@zag-js/utils");
var machine = (0, import_core.createMachine)({
  props({ props }) {
    return {
      defaultStep: 0,
      count: 1,
      linear: false,
      orientation: "horizontal",
      ...props
    };
  },
  context({ prop, bindable }) {
    return {
      step: bindable(() => ({
        defaultValue: prop("defaultStep"),
        value: prop("step"),
        onChange(value) {
          prop("onStepChange")?.({ step: value });
          const completed = value == prop("count");
          if (completed) prop("onStepComplete")?.();
        }
      }))
    };
  },
  computed: {
    percent: (0, import_core.memo)(
      ({ context, prop }) => [context.get("step"), prop("count")],
      ([step, count]) => step / count * 100
    ),
    hasNextStep: ({ context, prop }) => context.get("step") < prop("count"),
    hasPrevStep: ({ context }) => context.get("step") > 0,
    completed: ({ context, prop }) => context.get("step") === prop("count")
  },
  initialState() {
    return "idle";
  },
  entry: ["validateStepIndex"],
  states: {
    idle: {
      on: {
        "STEP.SET": [
          {
            guard: "isValidStepNavigation",
            actions: ["setStep"]
          },
          {
            actions: ["invokeOnStepInvalid"]
          }
        ],
        "STEP.NEXT": [
          {
            guard: "isCurrentStepValid",
            actions: ["goToNextStep"]
          },
          {
            actions: ["invokeOnStepInvalid"]
          }
        ],
        "STEP.PREV": {
          actions: ["goToPrevStep"]
        },
        "STEP.RESET": {
          actions: ["resetStep"]
        }
      }
    }
  },
  implementations: {
    guards: {
      isCurrentStepValid({ context, prop }) {
        const current = context.get("step");
        if (prop("isStepSkippable")?.(current)) return true;
        const isStepValid = prop("isStepValid");
        if (!isStepValid) return true;
        return isStepValid(current);
      },
      isValidStepNavigation({ context, event, prop }) {
        const current = context.get("step");
        if (event.value <= current) return true;
        if (prop("isStepSkippable")?.(current)) return true;
        const isStepValid = prop("isStepValid");
        if (!isStepValid) return true;
        return isStepValid(current);
      }
    },
    actions: {
      goToNextStep({ context, prop }) {
        const count = prop("count");
        context.set("step", Math.min(context.get("step") + 1, count));
      },
      goToPrevStep({ context }) {
        context.set("step", Math.max(context.get("step") - 1, 0));
      },
      resetStep({ context }) {
        context.set("step", 0);
      },
      setStep({ context, event }) {
        context.set("step", event.value);
      },
      validateStepIndex({ context, prop }) {
        validateStepIndex(prop("count"), context.get("step"));
      },
      invokeOnStepInvalid({ context, event, prop }) {
        prop("onStepInvalid")?.({
          step: context.get("step"),
          action: event.type === "STEP.NEXT" ? "next" : "set",
          targetStep: event.value
        });
      }
    }
  }
});
var validateStepIndex = (count, step) => {
  if (!(0, import_utils.isValueWithinRange)(step, 0, count)) {
    throw new RangeError(`[zag-js/steps] step index ${step} is out of bounds`);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  machine
});
