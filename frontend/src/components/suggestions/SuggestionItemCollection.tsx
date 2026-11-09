import { ToggleRoot } from "@ark-ui/react";
import { EyeIcon, EyeOffIcon } from "lucide-preact";
import { type ComponentChildren, Fragment } from "preact";
import { useState } from "preact/hooks";
import { CollectionCard } from "@/components/ui/CollectionCard";
import { InlineIcon } from "@/components/ui/InlineIcon";
import styles from "./SuggestionItemCollection.module.css";
import type { ItemRow } from "./suggestionItems";

type Props<T> = {
  rows: readonly ItemRow<T>[];
  /** Title in the top-left border, e.g. an icon and `References`. */
  label: ComponentChildren;
  testId: string;
  /** Renders a `SuggestionItemRow`. */
  renderRow: (row: ItemRow<T>) => ComponentChildren;
  /** Separating lines between rows instead of a plain gap. */
  dividers?: boolean;
  footer?: ComponentChildren;
};

/**
 * A suggestion's references, packages or maintainers.
 * Ignored items are hidden until shown with a toggle, and then appear at their original position.
 */
export function SuggestionItemCollection<T>({
  rows,
  label,
  testId,
  renderRow,
  dividers = false,
  footer,
}: Props<T>) {
  const [showIgnored, setShowIgnored] = useState(false);
  const ignoredCount = rows.filter((row) => row.state === "ignored").length;
  const visibleRows = showIgnored ? rows : rows.filter((row) => row.state !== "ignored");

  return (
    <CollectionCard
      items={visibleRows}
      label={label}
      viewToggle={
        <ToggleRoot
          pressed={showIgnored}
          onPressedChange={setShowIgnored}
          className={`row centered cursor-pointer ${styles.ignoredToggle}`}
          data-testid={`${testId}-ignored-toggle`}
        >
          <InlineIcon icon={showIgnored ? EyeIcon : EyeOffIcon} />
          Ignored ({ignoredCount})
        </ToggleRoot>
      }
      testId={testId}
      footer={footer}
    >
      {(shownRows) => (
        <ul className={`${styles.rows} ${dividers ? styles.dividers : ""}`}>
          {shownRows.map((row) => (
            <Fragment key={row.key}>{renderRow(row)}</Fragment>
          ))}
        </ul>
      )}
    </CollectionCard>
  );
}

type RowProps = {
  /** Action button, if the item can be acted upon. */
  action?: ComponentChildren;
  ignored: boolean;
  children: ComponentChildren;
};

/**
 * Item of a `SuggestionItemCollection`.
 * Provides the action button and fading when ignored.
 */
export function SuggestionItemRow({ action, ignored, children }: RowProps) {
  return (
    <li className={styles.row}>
      {action && <div className={styles.action}>{action}</div>}
      <div className={`${styles.content} ${ignored ? styles.faded : ""}`}>{children}</div>
    </li>
  );
}
