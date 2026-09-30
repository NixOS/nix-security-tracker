import type { ComponentChildren } from "preact";
import styles from "./LegendCard.module.css";

type Props = {
  /** Left border-legend content (e.g. a permalink and external link). */
  legend: ComponentChildren;
  /** Right border-legend content (e.g. a compact view-mode toggle). */
  viewToggle: ComponentChildren;
  /** Purely visual: dashed instead of solid border, e.g. for dimmed/filtered-out items. */
  dashed?: boolean;
  testId?: string;
  children: ComponentChildren;
};

/**
 * Fieldset-style bordered card: a left legend breaking the top border (e.g. a
 * permalink) and a right legend holding a compact view-mode toggle. Shared by
 * `Suggestion` and `Issue`.
 */
export function LegendCard({ legend, viewToggle, dashed = false, testId, children }: Props) {
  return (
    <article
      className={`column gap-big ${styles.card} ${dashed ? "border-dashed" : "shadow"}`}
      data-testid={testId}
    >
      <div className={`row gap-small ${styles.legend}`}>{legend}</div>
      <div className={styles.legendRight}>{viewToggle}</div>
      {children}
    </article>
  );
}
