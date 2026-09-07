// src/switch.machine.ts
import { createGuards, createMachine } from "@zag-js/core";
import { dispatchInputCheckedEvent, setElementChecked, trackFormControl, trackPress } from "@zag-js/dom-query";
import { trackFocusVisible } from "@zag-js/focus-visible";
import * as dom from "./switch.dom.mjs";
var { not } = createGuards();
var machine = createMachine({
  props({ props }) {
    return {
      defaultChecked: false,
      label: "switch",
      value: "on",
      ...props
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
        onChange(value) {
          prop("onCheckedChange")?.({ checked: value });
        }
      })),
      fieldsetDisabled: bindable(() => ({
        defaultValue: false
      })),
      focusVisible: bindable(() => ({
        defaultValue: false
      })),
      active: bindable(() => ({
        defaultValue: false
      })),
      focused: bindable(() => ({
        defaultValue: false
      })),
      hovered: bindable(() => ({
        defaultValue: false
      }))
    };
  },
  computed: {
    isDisabled: ({ context, prop }) => prop("disabled") || context.get("fieldsetDisabled")
  },
  watch({ track, prop, context, action }) {
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
  states: {
    ready: {}
  },
  implementations: {
    guards: {
      isTrusted: ({ event }) => !!event.isTrusted
    },
    effects: {
      trackPressEvent({ computed, scope, context }) {
        if (computed("isDisabled")) return;
        return trackPress({
          pointerNode: dom.getRootEl(scope),
          keyboardNode: dom.getHiddenInputEl(scope),
          isValidKey: (event) => event.key === " ",
          onPress: () => context.set("active", false),
          onPressStart: () => context.set("active", true),
          onPressEnd: () => context.set("active", false)
        });
      },
      trackFocusVisible({ computed, scope }) {
        if (computed("isDisabled")) return;
        return trackFocusVisible({ root: scope.getRootNode() });
      },
      trackFormControlState({ context, send, scope }) {
        return trackFormControl(dom.getHiddenInputEl(scope), {
          onFieldsetDisabledChange(disabled) {
            context.set("fieldsetDisabled", disabled);
          },
          onFormReset() {
            const checked = context.initial("checked");
            send({ type: "CHECKED.SET", checked: !!checked, src: "form-reset" });
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
      syncInputElement({ context, scope }) {
        const inputEl = dom.getHiddenInputEl(scope);
        if (!inputEl) return;
        setElementChecked(inputEl, !!context.get("checked"));
      },
      removeFocusIfNeeded({ context, prop }) {
        if (prop("disabled")) {
          context.set("focused", false);
        }
      },
      setChecked({ context, event }) {
        context.set("checked", event.checked);
      },
      toggleChecked({ context }) {
        context.set("checked", !context.get("checked"));
      },
      dispatchChangeEvent({ context, scope }) {
        queueMicrotask(() => {
          const inputEl = dom.getHiddenInputEl(scope);
          dispatchInputCheckedEvent(inputEl, { checked: context.get("checked") });
        });
      }
    }
  }
});
export {
  machine
};
