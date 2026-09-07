// src/dialog.machine.ts
import { ariaHidden } from "@zag-js/aria-hidden";
import { createMachine } from "@zag-js/core";
import { trackDismissableElement } from "@zag-js/dismissable";
import { getInitialFocus, raf } from "@zag-js/dom-query";
import { trapFocus } from "@zag-js/focus-trap";
import { preventBodyScroll } from "@zag-js/remove-scroll";
import * as dom from "./dialog.dom.mjs";
var machine = createMachine({
  props({ props, scope }) {
    const alertDialog = props.role === "alertdialog";
    const initialFocusEl = alertDialog ? () => dom.getCloseTriggerEl(scope) : void 0;
    const modal = typeof props.modal === "boolean" ? props.modal : true;
    return {
      role: "dialog",
      modal,
      trapFocus: modal,
      preventScroll: modal,
      closeOnInteractOutside: modal && !alertDialog,
      closeOnEscape: true,
      restoreFocus: true,
      initialFocusEl,
      ...props
    };
  },
  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen");
    return open ? "open" : "closed";
  },
  context({ bindable, prop, scope }) {
    return {
      rendered: bindable(() => ({
        defaultValue: { title: true, description: true }
      })),
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
    };
  },
  watch({ track, action, prop }) {
    track([() => prop("open")], () => {
      action(["toggleVisibility"]);
    });
  },
  states: {
    open: {
      entry: ["checkRenderedElements", "setInitialFocus"],
      effects: ["trackDismissableElement", "trapFocus", "preventScroll", "hideContentBelow"],
      on: {
        "CONTROLLED.CLOSE": {
          target: "closed"
        },
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"]
          },
          {
            target: "closed",
            actions: ["invokeOnClose"]
          }
        ],
        TOGGLE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"]
          },
          {
            target: "closed",
            actions: ["invokeOnClose"]
          }
        ],
        "TRIGGER_VALUE.SET": {
          actions: ["setTriggerValue"]
        }
      }
    },
    closed: {
      on: {
        "CONTROLLED.OPEN": {
          target: "open"
        },
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen", "setTriggerValue"]
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "setTriggerValue"]
          }
        ],
        TOGGLE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen", "setTriggerValue"]
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "setTriggerValue"]
          }
        ],
        "TRIGGER_VALUE.SET": {
          actions: ["setTriggerValue"]
        }
      }
    }
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop("open") != void 0
    },
    effects: {
      trackDismissableElement({ scope, send, prop }) {
        const getContentEl2 = () => dom.getContentEl(scope);
        return trackDismissableElement(getContentEl2, {
          type: "dialog",
          defer: true,
          pointerBlocking: prop("modal"),
          layerStyleTargets: [() => dom.getBackdropEl(scope), () => dom.getPositionerEl(scope)],
          exclude: [dom.getTriggerEl(scope), ...dom.getTriggerEls(scope)].filter(Boolean),
          onInteractOutside(event) {
            prop("onInteractOutside")?.(event);
            if (!prop("closeOnInteractOutside")) {
              event.preventDefault();
            }
          },
          persistentElements: prop("persistentElements"),
          onFocusOutside: prop("onFocusOutside"),
          onPointerDownOutside: prop("onPointerDownOutside"),
          onRequestDismiss: prop("onRequestDismiss"),
          onEscapeKeyDown(event) {
            prop("onEscapeKeyDown")?.(event);
            if (!prop("closeOnEscape")) {
              event.preventDefault();
            }
          },
          onDismiss() {
            send({ type: "CLOSE", src: "interact-outside" });
          }
        });
      },
      preventScroll({ scope, prop }) {
        if (!prop("preventScroll")) return;
        return preventBodyScroll(scope.getDoc());
      },
      trapFocus({ scope, prop, context }) {
        if (!prop("trapFocus")) return;
        const contentEl = () => dom.getContentEl(scope);
        return trapFocus(contentEl, {
          preventScroll: true,
          returnFocusOnDeactivate: !!prop("restoreFocus"),
          initialFocus: () => getInitialFocus({
            root: dom.getContentEl(scope),
            getInitialEl: prop("initialFocusEl")
          }),
          setReturnFocus: (el) => {
            const finalFocusEl = prop("finalFocusEl")?.();
            if (finalFocusEl) return finalFocusEl;
            const triggerValue = context.get("triggerValue");
            if (triggerValue) {
              const activeTriggerEl = dom.getActiveTriggerEl(scope, triggerValue);
              if (activeTriggerEl) return activeTriggerEl;
            }
            const fallbackTrigger = dom.getTriggerEls(scope)[0];
            if (fallbackTrigger) return fallbackTrigger;
            return el;
          },
          getShadowRoot: true
        });
      },
      hideContentBelow({ scope, prop }) {
        if (!prop("modal")) return;
        const getElements = () => [dom.getContentEl(scope)];
        return ariaHidden(getElements, { defer: true });
      }
    },
    actions: {
      setInitialFocus({ prop, scope }) {
        if (prop("trapFocus")) return;
        raf(() => {
          const element = getInitialFocus({
            root: dom.getContentEl(scope),
            getInitialEl: prop("initialFocusEl")
          });
          element?.focus({ preventScroll: true });
        });
      },
      checkRenderedElements({ context, scope }) {
        raf(() => {
          context.set("rendered", {
            title: !!dom.getTitleEl(scope),
            description: !!dom.getDescriptionEl(scope)
          });
        });
      },
      invokeOnClose({ prop }) {
        prop("onOpenChange")?.({ open: false });
      },
      invokeOnOpen({ prop }) {
        prop("onOpenChange")?.({ open: true });
      },
      setTriggerValue({ context, event }) {
        if (event.value === void 0) return;
        context.set("triggerValue", event.value);
      },
      toggleVisibility({ prop, send, event }) {
        send({
          type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
          previousEvent: event
        });
      }
    }
  }
});
export {
  machine
};
