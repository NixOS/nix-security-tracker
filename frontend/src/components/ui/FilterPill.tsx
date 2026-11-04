import { type LucideIcon, XIcon } from "lucide-preact";
import type { ComponentChildren } from "preact";
import styles from "./FilterPill.module.css";

/** Class for the text inputs placed inside a filter pill */
export const filterInputClass = styles.input;

type Props = {
  icon: LucideIcon;
  active: boolean;
  /** Accessible name of the clear button */
  clearLabel: string;
  onClear: () => void;
  testId?: string;
  children: ComponentChildren;
};

/**
 * Rounded filter control, highlighted while a filter is set, with a button to clear it.
 */
export function FilterPill({ icon: Icon, active, clearLabel, onClear, testId, children }: Props) {
  return (
    <div
      className={`row centered gap-small bg-gray-light rounded-full ${styles.pill} ${active ? "bg-nixos-blue text-white" : ""}`}
      data-testid={testId}
    >
      <Icon />
      {children}
      <button
        type="button"
        className={`cursor-pointer ${styles.clear}`}
        aria-label={clearLabel}
        disabled={!active}
        onClick={onClear}
      >
        <XIcon />
      </button>
    </div>
  );
}
