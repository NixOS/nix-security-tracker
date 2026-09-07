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

// src/timer.machine.ts
var timer_machine_exports = {};
__export(timer_machine_exports, {
  machine: () => machine
});
module.exports = __toCommonJS(timer_machine_exports);
var import_core = require("@zag-js/core");
var import_utils = require("@zag-js/utils");
var machine = (0, import_core.createMachine)({
  props({ props }) {
    validateProps(props);
    return {
      interval: 1e3,
      startMs: 0,
      ...props
    };
  },
  initialState({ prop }) {
    return prop("autoStart") ? "running" : "idle";
  },
  context({ prop, bindable }) {
    return {
      currentMs: bindable(() => ({
        defaultValue: prop("startMs")
      }))
    };
  },
  watch({ track, send, prop }) {
    track([() => prop("startMs")], () => {
      send({ type: "RESTART" });
    });
  },
  on: {
    RESTART: {
      target: "running:temp",
      actions: ["resetTime"]
    }
  },
  computed: {
    time: ({ context }) => msToTime(context.get("currentMs")),
    formattedTime: ({ computed }) => formatTime(computed("time")),
    progressPercent: (0, import_core.memo)(
      ({ context, prop }) => [context.get("currentMs"), prop("targetMs"), prop("startMs"), prop("countdown")],
      ([currentMs, targetMs = 0, startMs, countdown]) => {
        const percent = countdown ? toPercent(currentMs, targetMs, startMs) : toPercent(currentMs, startMs, targetMs);
        return (0, import_utils.clampValue)(percent, 0, 1);
      }
    )
  },
  states: {
    idle: {
      on: {
        START: {
          target: "running"
        },
        RESET: {
          actions: ["resetTime"]
        }
      }
    },
    "running:temp": {
      effects: ["waitForNextTick"],
      on: {
        CONTINUE: {
          target: "running"
        }
      }
    },
    running: {
      effects: ["keepTicking"],
      on: {
        PAUSE: {
          target: "paused"
        },
        TICK: [
          {
            target: "idle",
            guard: "hasReachedTarget",
            actions: ["invokeOnComplete"]
          },
          {
            actions: ["updateTime", "invokeOnTick"]
          }
        ],
        RESET: {
          actions: ["resetTime"]
        }
      }
    },
    paused: {
      on: {
        RESUME: {
          target: "running"
        },
        RESET: {
          target: "idle",
          actions: ["resetTime"]
        }
      }
    }
  },
  implementations: {
    effects: {
      keepTicking({ prop, send }) {
        return (0, import_utils.setRafInterval)(({ deltaMs }) => {
          send({ type: "TICK", deltaMs });
        }, prop("interval"));
      },
      waitForNextTick({ send }) {
        return (0, import_utils.setRafTimeout)(() => {
          send({ type: "CONTINUE" });
        }, 0);
      }
    },
    actions: {
      updateTime({ context, prop, event }) {
        const sign = prop("countdown") ? -1 : 1;
        const deltaMs = roundToInterval(event.deltaMs, prop("interval"));
        context.set("currentMs", (prev) => {
          const newValue = prev + sign * deltaMs;
          let targetMs = prop("targetMs");
          if (targetMs == null && prop("countdown")) targetMs = 0;
          if (prop("countdown") && targetMs != null) {
            return Math.max(newValue, targetMs);
          } else if (!prop("countdown") && targetMs != null) {
            return Math.min(newValue, targetMs);
          }
          return newValue;
        });
      },
      resetTime({ context, prop }) {
        let targetMs = prop("targetMs");
        if (targetMs == null && prop("countdown")) targetMs = 0;
        context.set("currentMs", prop("startMs") ?? 0);
      },
      invokeOnTick({ context, prop, computed }) {
        prop("onTick")?.({
          value: context.get("currentMs"),
          time: computed("time"),
          formattedTime: computed("formattedTime")
        });
      },
      invokeOnComplete({ prop }) {
        prop("onComplete")?.();
      }
    },
    guards: {
      hasReachedTarget: ({ context, prop }) => {
        let targetMs = prop("targetMs");
        if (targetMs == null && prop("countdown")) targetMs = 0;
        if (targetMs == null) return false;
        const currentMs = context.get("currentMs");
        return prop("countdown") ? currentMs <= targetMs : currentMs >= targetMs;
      }
    }
  }
});
function msToTime(ms) {
  const time = Math.max(0, ms);
  const milliseconds = time % 1e3;
  const seconds = Math.floor(time / 1e3) % 60;
  const minutes = Math.floor(time / (1e3 * 60)) % 60;
  const hours = Math.floor(time / (1e3 * 60 * 60)) % 24;
  const days = Math.floor(time / (1e3 * 60 * 60 * 24));
  return {
    days,
    hours,
    minutes,
    seconds,
    milliseconds
  };
}
function toPercent(value, minValue, maxValue) {
  const range = maxValue - minValue;
  if (range === 0) return 0;
  return (value - minValue) / range;
}
function padStart(num, size = 2) {
  return num.toString().padStart(size, "0");
}
function roundToInterval(value, interval) {
  return Math.floor(value / interval) * interval;
}
function formatTime(time) {
  const { days, hours, minutes, seconds } = time;
  return {
    days: padStart(days),
    hours: padStart(hours),
    minutes: padStart(minutes),
    seconds: padStart(seconds),
    milliseconds: padStart(time.milliseconds, 3)
  };
}
function validateProps(props) {
  const { startMs, targetMs, countdown, interval } = props;
  if (interval != null && (typeof interval !== "number" || interval <= 0)) {
    throw new Error(`[timer] Invalid interval: ${interval}. Must be a positive number.`);
  }
  if (startMs != null && (typeof startMs !== "number" || startMs < 0)) {
    throw new Error(`[timer] Invalid startMs: ${startMs}. Must be a non-negative number.`);
  }
  if (targetMs != null && (typeof targetMs !== "number" || targetMs < 0)) {
    throw new Error(`[timer] Invalid targetMs: ${targetMs}. Must be a non-negative number.`);
  }
  if (countdown && startMs != null && targetMs != null) {
    if (startMs <= targetMs) {
      throw new Error(
        `[timer] Invalid countdown configuration: startMs (${startMs}) must be greater than targetMs (${targetMs}).`
      );
    }
  }
  if (!countdown && startMs != null && targetMs != null) {
    if (startMs >= targetMs) {
      throw new Error(
        `[timer] Invalid stopwatch configuration: startMs (${startMs}) must be less than targetMs (${targetMs}).`
      );
    }
  }
  if (countdown && targetMs == null && startMs != null && startMs <= 0) {
    throw new Error(
      `[timer] Invalid countdown configuration: startMs (${startMs}) must be greater than 0 when no targetMs is provided.`
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  machine
});
