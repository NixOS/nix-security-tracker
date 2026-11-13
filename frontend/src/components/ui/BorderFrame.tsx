import type { ComponentChildren } from "preact";
import { cx } from "@/utils/className";
import styles from "./BorderFrame.module.css";

type Props = {
  topLeft?: ComponentChildren;
  topRight?: ComponentChildren;
  bottomLeft?: ComponentChildren;
  bottomRight?: ComponentChildren;
  border?: "solid" | "dashed";
  shadow?: boolean;
  rounded?: boolean;
  /** Shifts the right slots inwards by this frame's padding and border, so they line up with the right slots of frames nested inside. */
  alignSlotsWithNested?: boolean;
  /** Id of the element naming the frame, typically a heading in a slot. */
  labelledBy?: string;
  /** Accessible description of the frame, e.g. why it is dimmed. */
  description?: string;
  as?: "article" | "section" | "div";
  testId?: string;
  children: ComponentChildren;
};

/** Bordered box with content set into its border at up to four corners, fieldset-style. */
export function BorderFrame({
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  border = "solid",
  shadow = false,
  rounded = false,
  alignSlotsWithNested = false,
  labelledBy,
  description,
  as: Tag = "div",
  testId,
  children,
}: Props) {
  const hasTop = Boolean(topLeft || topRight);
  const hasBottom = Boolean(bottomLeft || bottomRight);
  const className = cx(
    "column gap",
    styles.frame,
    border === "dashed" && styles.dashed,
    shadow && "shadow",
    rounded && "rounded",
    alignSlotsWithNested && styles.alignSlotsWithNested,
    hasTop && styles.withTop,
    hasBottom && styles.withBottom,
  );

  return (
    <Tag
      className={className}
      aria-labelledby={labelledBy}
      aria-description={description}
      data-testid={testId}
    >
      {topLeft && <div className={`${styles.slot} ${styles.top} ${styles.left}`}>{topLeft}</div>}
      {topRight && <div className={`${styles.slot} ${styles.top} ${styles.right}`}>{topRight}</div>}
      {children}
      {bottomLeft && (
        <div className={`${styles.slot} ${styles.bottom} ${styles.left}`}>{bottomLeft}</div>
      )}
      {bottomRight && (
        <div className={`${styles.slot} ${styles.bottom} ${styles.right}`}>{bottomRight}</div>
      )}
    </Tag>
  );
}
