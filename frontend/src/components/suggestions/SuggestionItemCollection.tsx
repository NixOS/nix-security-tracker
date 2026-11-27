import { ToggleRoot } from "@ark-ui/react";
import { EyeIcon, EyeOffIcon } from "lucide-preact";
import { type ComponentChildren, Fragment } from "preact";
import { useState } from "preact/hooks";
import { CollectionCard } from "@/components/ui/CollectionCard";
import { InlineIcon } from "@/components/ui/InlineIcon";
import { cx } from "@/utils/className";
import styles from "./SuggestionItemCollection.module.css";
import { type ItemRow, ignoredRows, shownRows } from "./suggestionItems";

type Props<T> = {
  rows: readonly ItemRow<T>[];
  /** Title in the top-left border, e.g. an icon and `References`. */
  label: ComponentChildren;
  testId: string;
  /** Renders a list item, usually a `SuggestionItemRow`. */
  renderRow: (row: ItemRow<T>, showIgnored: boolean) => ComponentChildren;
  /** Number of ignored items, when rows hold several items. Defaults to the number of ignored rows. */
  ignoredCount?: number;
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
  ignoredCount = ignoredRows(rows).length,
}: Props<T>) {
  const [showIgnored, setShowIgnored] = useState(false);
  const visibleRows = shownRows(rows, showIgnored);

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
      {(pageRows) => (
        <ul className={cx(styles.rows, dividers && styles.dividers)}>
          {pageRows.map((row) => (
            <Fragment key={row.key}>{renderRow(row, showIgnored)}</Fragment>
          ))}
        </ul>
      )}
    </CollectionCard>
  );
}

type LineProps = {
  /** Action button, if the item can be acted upon. */
  action?: ComponentChildren;
  ignored: boolean;
  children: ComponentChildren;
};

/**
 * Item of a `SuggestionItemCollection`, made of one line.
 */
export function SuggestionItemRow(props: LineProps) {
  return (
    <li>
      <SuggestionItemLine {...props} />
    </li>
  );
}

/**
 * Line of an item, with the action button and fading when ignored.
 * Lines nested in an item line up with it, as long as they are not inside its content.
 */
export function SuggestionItemLine({ action, ignored, children }: LineProps) {
  return (
    <div className={styles.row}>
      {action && <div className={styles.action}>{action}</div>}
      <div className={cx(styles.content, ignored && styles.faded)}>{children}</div>
    </div>
  );
}
