import { SearchIcon } from "lucide-preact";
import { Link } from "wouter-preact";
import styles from "./FilterShortcut.module.css";

type Props = {
  href: string;
  label: string;
};

/**
 * Link to the suggestion list filtered by a value, revealed when hovering the element containing it.
 */
export function FilterShortcut({ href, label }: Props) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={styles.shortcut}
      onClick={(e) => {
        // The link sits inside tree items, which would otherwise handle the click as a selection.
        e.stopPropagation();
        // Scroll back to the top after the filter is applied as suggestions in the list will change.
        // Also gives confirmation to the user by showing them the filters on top.
        window.scrollTo({ top: 0 });
      }}
    >
      <SearchIcon />
    </Link>
  );
}
