import { useState } from "preact/hooks";

/**
 * View mode of a card that follows its parent's until the card overrides it locally.
 *
 * @param inherited - Default or parent's view mode.
 * @param allowClear - Whether the local override can be cleared to follow the parent again.
 * @returns The effective `viewMode`, the `selectedViewMode` to highlight in the card's toggle, and `setOwnViewMode`.
 */
export function useInheritedViewMode<T extends string>(
  inherited: T,
  allowClear: boolean,
): {
  viewMode: T;
  selectedViewMode: T | undefined;
  setOwnViewMode: (viewMode: T | undefined) => void;
} {
  const [ownViewMode, setOwnViewMode] = useState<T | undefined>(undefined);
  const viewMode = ownViewMode ?? inherited;
  // Only show a selection when the card has its own override
  const selectedViewMode = allowClear ? ownViewMode : viewMode;
  return { viewMode, selectedViewMode, setOwnViewMode };
}
