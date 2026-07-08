import {
  SwitchControl,
  SwitchHiddenInput,
  SwitchLabel,
  SwitchRoot,
  SwitchThumb,
} from "@ark-ui/react";
import type { ComponentChildren } from "preact";
import styles from "./Switch.module.css";

type SwitchProps = {
  checked: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ComponentChildren;
};

export function Switch({ checked, disabled, isLoading, onCheckedChange, children }: SwitchProps) {
  return (
    <SwitchRoot
      checked={checked}
      disabled={disabled || isLoading}
      onCheckedChange={({ checked }) => onCheckedChange(checked)}
      className={`row centered gap-small ${styles.switch} ${isLoading ? styles.switchLoading : ""}`}
    >
      <SwitchControl className={`row centered ${styles.control} ${isLoading ? "loading" : ""}`}>
        {!isLoading && <SwitchThumb className={styles.thumb} />}
      </SwitchControl>
      <SwitchLabel className={styles.label}>{children}</SwitchLabel>
      <SwitchHiddenInput />
    </SwitchRoot>
  );
}
