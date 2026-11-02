import type { LucideIcon, LucideProps } from "lucide-preact";
import type { ComponentChildren } from "preact";
import styles from "./InlineIcon.module.css";
import { Spinner } from "./Spinner";

type RawProps = {
  /** The icon follows its label instead of preceding it. */
  after?: boolean;
  /** The icon element, rendered as is. */
  children: ComponentChildren;
};

/**
 * Any icon element placed next to a text label, which never wraps onto a different line than the label.
 */
export function RawInlineIcon({ after = false, children }: RawProps) {
  return <span className={after ? styles.after : styles.before}>{children}</span>;
}

type Props = LucideProps & {
  icon: LucideIcon;
  /** The icon follows its label instead of preceding it. */
  after?: boolean;
  /** Show a spinner in place of the icon. */
  pending?: boolean;
};

/**
 * Lucide icon placed next to a text label, which never wraps onto a different line than the label.
 */
export function InlineIcon({ icon: Icon, after, pending = false, ...iconProps }: Props) {
  return (
    <RawInlineIcon after={after}>{pending ? <Spinner /> : <Icon {...iconProps} />}</RawInlineIcon>
  );
}
