import { useEffect, useState } from "preact/hooks";

type Listener = () => void;

// Registry of shared tickers, keyed by interval duration. Every component
// calling `useTick` with the same `intervalMs` subscribes to the same
// `setInterval`, so rendering the same tick rate from many places (e.g. once
// per row in a list) never creates more than one timer per unique interval.
const tickers = new Map<number, { id: ReturnType<typeof setInterval>; listeners: Set<Listener> }>();

function subscribe(intervalMs: number, listener: Listener): () => void {
  let ticker = tickers.get(intervalMs);
  if (!ticker) {
    const listeners = new Set<Listener>();
    const id = setInterval(() => {
      for (const l of listeners) l();
    }, intervalMs);
    ticker = { id, listeners };
    tickers.set(intervalMs, ticker);
  }
  ticker.listeners.add(listener);

  return () => {
    ticker.listeners.delete(listener);
    if (ticker.listeners.size === 0) {
      clearInterval(ticker.id);
      tickers.delete(intervalMs);
    }
  };
}

/**
 * Forces the calling component to re-render every `intervalMs` milliseconds.
 *
 * Components requesting the same `intervalMs` share a single underlying
 * timer, so this stays cheap even when called from many components at once.
 */
export function useTick(intervalMs: number): void {
  const [, setTick] = useState(0);

  useEffect(() => subscribe(intervalMs, () => setTick((t) => t + 1)), [intervalMs]);
}
