import type { ComponentChildren } from "preact";
import styles from "./FrameLegend.module.css";

type Props = {
  /** Element rendered, e.g. a heading when the legend names the frame. */
  as?: "h2" | "h3" | "span" | "div";
  id?: string;
  children: ComponentChildren;
};

/**
 * Gray text set into the border of a `BorderFrame`, fieldset-legend-style.
 */
export function FrameLegend({ as: Tag = "span", id, children }: Props) {
  return (
    <Tag id={id} className={styles.legend}>
      {children}
    </Tag>
  );
}
