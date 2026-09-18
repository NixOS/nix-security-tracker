import { CollapsibleContent, CollapsibleRoot } from "@ark-ui/react";
import type { ComponentChildren } from "preact";
import styles from "./Collapsible.module.css";

type Props = {
  open: boolean;
  children: ComponentChildren;
};

export function Collapsible({ open, children }: Props) {
  return (
    <CollapsibleRoot open={open} lazyMount unmountOnExit>
      <CollapsibleContent className={styles.content}>{children}</CollapsibleContent>
    </CollapsibleRoot>
  );
}
