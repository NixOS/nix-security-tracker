import type { LucideIcon } from "lucide-preact";
import { InlineIcon } from "@/components/ui/InlineIcon";
import styles from "./IgnoreRestoreButton.module.css";

type ItemAction = "ignore" | "restore" | "delete";

const LABELS: Record<ItemAction, string> = {
  ignore: "Ignore",
  restore: "Restore",
  delete: "Delete",
};

type Props = {
  action: ItemAction;
  icon: LucideIcon;
  onClick: () => void;
  disabled: boolean;
};

/**
 * Action button on a suggestion's item (reference, package, maintainer).
 */
export function IgnoreRestoreButton({ action, icon, onClick, disabled }: Props) {
  return (
    <button
      type="button"
      className={`btn ${action === "restore" ? "btn-green" : action === "delete" ? "btn-red" : "btn-gray"}`}
      onClick={onClick}
      disabled={disabled}
    >
      <InlineIcon icon={icon} />
      <span className={styles.labels}>
        {/* FIXME(@florentc): hidden labels serve to occupy space and render buttons with the same size so they stack well
         * It'd be more elegant to manage that at the list level. */}
        {Object.entries(LABELS).map(([labelAction, label]) => (
          <span
            key={labelAction}
            className={labelAction === action ? undefined : styles.hiddenLabel}
            aria-hidden={labelAction !== action || undefined}
          >
            {label}
          </span>
        ))}
      </span>
    </button>
  );
}
