import { AuthStatus } from "./AuthStatus";
import styles from "./HeaderBar.module.css";
import { Title } from "./Title";

export function HeaderBar() {
  return (
    <header className={`row gap spread centered bg-nixos-blue text-white ${styles.headerBar}`}>
      <Title />
      <AuthStatus />
    </header>
  );
}
