import type { ComponentChildren } from "preact";
import { useLayoutEffect, useRef } from "preact/hooks";

const DURATION_MS = 200;

type Props = {
  /** The height is animated when this value changes, e.g. an expanded state. */
  trigger: unknown;
  id?: string;
  children: ComponentChildren;
};

/**
 * Animates its height when `trigger` changes, e.g. as a list expands or collapses.
 * Other content changes resize it instantly.
 */
export function HeightTransition({ trigger, id, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const lastHeight = useRef<number | null>(null);
  const lastTrigger = useRef(trigger);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const running = element.getAnimations();
    // NOTE(@florentc): A running animation sets the current height, so toggling again reverses from there.
    const from = running.length > 0 ? element.getBoundingClientRect().height : lastHeight.current;
    for (const animation of running) {
      animation.cancel();
    }
    const to = element.offsetHeight;

    if (
      trigger !== lastTrigger.current &&
      from !== null &&
      from !== to &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      element.animate(
        [
          { height: `${from}px`, overflow: "hidden" },
          { height: `${to}px`, overflow: "hidden" },
        ],
        { duration: DURATION_MS, easing: "ease-out" },
      );
    }
    lastHeight.current = to;
    lastTrigger.current = trigger;
  });

  return (
    <div ref={ref} id={id}>
      {children}
    </div>
  );
}
