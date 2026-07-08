import { Link } from "wouter-preact";
import styles from "./Title.module.css";

export function Title() {
  return (
    <h1 className="text-xl bold">
      <Link href="/ui-v2/" className={`row gap-small centered ${styles.link}`}>
        <img src="/static/nixos-logo.svg" alt="" aria-hidden="true" className={styles.logo} />
        Nixpkgs security tracker
      </Link>
    </h1>
  );
}
