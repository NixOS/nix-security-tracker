import { ToggleGroupItem, ToggleGroupRoot } from "@ark-ui/react";
import type { ComponentChildren } from "preact";
import styles from "./PillToggleGroup.module.css";

export type ToggleGroupOption = {
  value: string;
  label: ComponentChildren;
  /** Tooltip/accessible name */
  title?: string;
};

type Props = {
  value: string[];
  options: ToggleGroupOption[];
  onItemClick: (value: string, event: MouseEvent) => void;
};

/**
 * Multi-select pills: each option is independently toggleable. Selection is
 * fully controlled by the caller via `value`/`onItemClick` (e.g. to support
 * shift/ctrl/meta-click additive selection), so Ark UI's own
 * `onValueChange` isn't used.
 */
export function PillToggleGroup({ value, options, onItemClick }: Props) {
  return (
    <ToggleGroupRoot value={value} onValueChange={() => {}} multiple className="row gap-small wrap">
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          title={option.title}
          aria-label={option.title}
          onClick={(event: MouseEvent) => onItemClick(option.value, event)}
          className={`rounded-full border cursor-pointer ${styles.item}`}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroupRoot>
  );
}
