import { ToggleGroupItem, ToggleGroupRoot } from "@ark-ui/react";
import type { ComponentChildren } from "preact";
import { cx } from "@/utils/className";
import styles from "./SegmentedToggleGroup.module.css";

export type SegmentedToggleOption = {
  value: string;
  label: ComponentChildren;
  /** Tooltip/accessible name */
  title?: string;
  /**
   * Marks this option as the effective value even though it isn't explicitly
   * selected (e.g. a value inherited from a parent). Rendered distinctly from
   * both the selected and plain unselected states.
   */
  current?: boolean;
};

type Props = {
  value: string | undefined;
  options: SegmentedToggleOption[];
  /** Smaller and on a white background, e.g. to sit in a `BorderFrame` slot. */
  compact?: boolean;
  onItemClick: (value: string, event: MouseEvent) => void;
};

/**
 * Single connected segmented control (e.g. issue/suggestion display density
 * switcher). Selection is fully controlled by the caller via
 * `value`/`onItemClick` (to support clearing back to an inherited value), so
 * Ark UI's own `onValueChange` isn't used.
 */
export function SegmentedToggleGroup({ value, options, compact = false, onItemClick }: Props) {
  return (
    <ToggleGroupRoot
      value={value ? [value] : []}
      onValueChange={() => {}}
      multiple
      className={cx(styles.segmentedRoot, compact && styles.compact)}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          title={option.title}
          aria-label={option.title}
          data-current={option.current ? "true" : undefined}
          onClick={(event: MouseEvent) => onItemClick(option.value, event)}
          className={`cursor-pointer ${styles.item} ${styles.segmentedItem}`}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroupRoot>
  );
}
