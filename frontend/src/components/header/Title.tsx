import { Link } from "wouter-preact";
import styles from "./Title.module.css";

export function Title() {
  return (
    <h1 className={`text-xl bold ${styles.title}`}>
      <Link href="/ui-v2/" className={`row gap-small ${styles.link} centered`}>
        <img src="/static/nixos-logo.svg" alt="" aria-hidden="true" className={styles.logo} />
        <span className="no-line-breaks hide-below-breakpoint">Nixpkgs security tracker</span>
      </Link>
    </h1>
  );
}
