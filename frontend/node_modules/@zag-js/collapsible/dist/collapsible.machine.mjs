// src/collapsible.machine.ts
import { createMachine } from "@zag-js/core";
import {
  getComputedStyle,
  getEventTarget,
  getTabbables,
  nextTick,
  observeChildren,
  raf,
  setAttribute,
  setStyle
} from "@zag-js/dom-query";
import * as dom from "./collapsible.dom.mjs";
var machine = createMachine({
  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen");
    return open ? "open" : "closed";
  },
  context({ bindable }) {
    return {
      size: bindable(() => ({
        defaultValue: { height: 0, width: 0 },
        sync: true
      })),
      initial: bindable(() => ({
        defaultValue: false
      }))
    };
  },
  refs() {
    return {
      cleanup: void 0,
      stylesRef: void 0
    };
  },
  watch({ track, prop, action }) {
    track([() => prop("open")], () => {
      action(["setInitial", "computeSize", "toggleVisibility"]);
    });
  },
  exit: ["cleanupNode"],
  states: {
    closed: {
      effects: ["trackTabbableElements"],
      on: {
        "controlled.open": {
          target: "open"
        },
        open: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"]
          },
          {
            target: "open",
            actions: ["setInitial", "computeSize", "invokeOnOpen"]
          }
        ]
      }
    },
    closing: {
      effects: ["trackExitAnimation"],
      on: {
        "controlled.close": {
          target: "closed"
        },
        "controlled.open": {
          target: "open"
        },
        open: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"]
          },
          {
            target: "open",
            actions: ["setInitial", "invokeOnOpen"]
          }
        ],
        close: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnExitComplete"]
          },
          {
            target: "closed",
            actions: ["setInitial", "computeSize", "invokeOnExitComplete"]
          }
        ],
        "animation.end": {
          target: "closed",
          actions: ["invokeOnExitComplete", "clearInitial"]
        }
      }
    },
    open: {
      effects: ["trackEnterAnimation"],
      on: {
        "controlled.close": {
          target: "closing"
        },
        close: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"]
          },
          {
            target: "closing",
            actions: ["setInitial", "computeSize", "invokeOnClose"]
          }
        ],
        "size.measure": {
          actions: ["measureSize"]
        },
        "animation.end": {
          actions: ["clearInitial"]
        }
      }
    }
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop("open") != void 0
    },
    effects: {
      trackEnterAnimation: ({ send, scope }) => {
        let cleanup;
        const rafCleanup = raf(() => {
          const contentEl = dom.getContentEl(scope);
          if (!contentEl) return;
          const animationName = getComputedStyle(contentEl).animationName;
          const hasNoAnimation = !animationName || animationName === "none";
          if (hasNoAnimation) {
            send({ type: "animation.end" });
            return;
          }
          const onEnd = (event) => {
            const target = getEventTarget(event);
            if (target === contentEl) {
              send({ type: "animation.end" });
            }
          };
          contentEl.addEventListener("animationend", onEnd);
          cleanup = () => {
            contentEl.removeEventListener("animationend", onEnd);
          };
        });
        return () => {
          rafCleanup();
          cleanup?.();
        };
      },
      trackExitAnimation: ({ send, scope }) => {
        let cleanup;
        const rafCleanup = raf(() => {
          const contentEl = dom.getContentEl(scope);
          if (!contentEl) return;
          const animationName = getComputedStyle(contentEl).animationName;
          const hasNoAnimation = !animationName || animationName === "none";
          if (hasNoAnimation) {
            send({ type: "animation.end" });
            return;
          }
          const onEnd = (event) => {
            const target = getEventTarget(event);
            if (target === contentEl) {
              send({ type: "animation.end" });
            }
          };
          contentEl.addEventListener("animationend", onEnd);
          const restoreStyles = setStyle(contentEl, {
            animationFillMode: "forwards"
          });
          cleanup = () => {
            contentEl.removeEventListener("animationend", onEnd);
            nextTick(() => restoreStyles());
          };
        });
        return () => {
          rafCleanup();
          cleanup?.();
        };
      },
      trackTabbableElements: ({ scope, prop }) => {
        if (!prop("collapsedHeight") && !prop("collapsedWidth")) return;
        const contentEl = dom.getContentEl(scope);
        if (!contentEl) return;
        const applyInertToTabbables = () => {
          const tabbables = getTabbables(contentEl);
          const restoreAttrs = tabbables.map((tabbable) => setAttribute(tabbable, "inert", ""));
          return () => {
            restoreAttrs.forEach((attr) => attr());
          };
        };
        let restoreInert = applyInertToTabbables();
        const observerCleanup = observeChildren(contentEl, {
          callback() {
            restoreInert();
            restoreInert = applyInertToTabbables();
          }
        });
        return () => {
          restoreInert();
          observerCleanup();
        };
      }
    },
    actions: {
      setInitial: ({ context, flush }) => {
        flush(() => {
          context.set("initial", true);
        });
      },
      clearInitial: ({ context }) => {
        context.set("initial", false);
      },
      cleanupNode: ({ refs }) => {
        refs.set("stylesRef", null);
      },
      measureSize: ({ context, scope }) => {
        const contentEl = dom.getContentEl(scope);
        if (!contentEl) return;
        const { height, width } = contentEl.getBoundingClientRect();
        context.set("size", { height, width });
      },
      computeSize: ({ refs, scope, context }) => {
        refs.get("cleanup")?.();
        const rafCleanup = raf(() => {
          const contentEl = dom.getContentEl(scope);
          if (!contentEl) return;
          const hidden = contentEl.hidden;
          contentEl.style.animationName = "none";
          contentEl.style.animationDuration = "0s";
          contentEl.hidden = false;
          const rect = contentEl.getBoundingClientRect();
          context.set("size", { height: rect.height, width: rect.width });
          if (context.get("initial")) {
            contentEl.style.animationName = "";
            contentEl.style.animationDuration = "";
          }
          contentEl.hidden = hidden;
        });
        refs.set("cleanup", rafCleanup);
      },
      invokeOnOpen: ({ prop }) => {
        prop("onOpenChange")?.({ open: true });
      },
      invokeOnClose: ({ prop }) => {
        prop("onOpenChange")?.({ open: false });
      },
      invokeOnExitComplete: ({ prop }) => {
        prop("onExitComplete")?.();
      },
      toggleVisibility: ({ prop, send }) => {
        send({ type: prop("open") ? "controlled.open" : "controlled.close" });
      }
    }
  }
});
export {
  machine
};
