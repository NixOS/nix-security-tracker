import { useEffect, useRef, useState } from "preact/hooks";

const DEFAULT_DELAY_MS = 500;

type Options<T> = {
  delayMs?: number;
  equals?: (a: T, b: T) => boolean;
};

/**
 * Local draft of a URL-backed value, committed after the user stops typing.
 */
export function useDebouncedSync<T>(
  value: T,
  commit: (value: T) => void,
  { delayMs = DEFAULT_DELAY_MS, equals = Object.is }: Options<T> = {},
) {
  const [draft, setDraft] = useState(value);
  const lastValue = useRef(value);

  // Re-sync from the URL (e.g. back/forward navigation, external link).
  // NOTE(@florentc): Compared by hand rather than through effect dependencies, so that values rebuilt on each render still work.
  useEffect(() => {
    if (equals(lastValue.current, value)) return;
    lastValue.current = value;
    setDraft(value);
  });

  useEffect(() => {
    if (equals(draft, value)) return;
    const timeout = setTimeout(() => commit(draft), delayMs);
    return () => clearTimeout(timeout);
  }, [draft]);

  const commitNow = (next: T) => {
    setDraft(next);
    commit(next);
  };

  return { draft, setDraft, commitNow, pending: !equals(draft, value) };
}
