import { ToggleGroupItem, ToggleGroupRoot } from "@ark-ui/react";
import type { ComponentChildren } from "preact";
import styles from "./ToggleGroup.module.css";

export type ToggleGroupOption = {
  value: string;
  label: ComponentChildren;
  /** Tooltip/accessible name */
  title?: string;
};

type ToggleGroupProps = {
  value: string[];
  options: ToggleGroupOption[];
  /**
   * `"pills"` (default): separate rounded
   * `"segmented"`: single connected control
   */
  variant?: "pills" | "segmented";
  onItemClick: (value: string, event: MouseEvent) => void;
};

export function ToggleGroup({ value, options, variant = "pills", onItemClick }: ToggleGroupProps) {
  const rootClassName =
    variant === "segmented" ? `row ${styles.segmentedRoot}` : "row gap-small wrap";
  const itemClassName =
    variant === "segmented"
      ? `cursor-pointer ${styles.item} ${styles.segmentedItem}`
      : `rounded-full border cursor-pointer ${styles.item}`;

  return (
    <ToggleGroupRoot value={value} onValueChange={() => {}} multiple className={rootClassName}>
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          title={option.title}
          aria-label={option.title}
          onClick={(event: MouseEvent) => onItemClick(option.value, event)}
          className={itemClassName}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroupRoot>
  );
}
