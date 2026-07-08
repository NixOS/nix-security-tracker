import {
  MenuContent,
  MenuItem,
  MenuItemGroup,
  MenuItemGroupLabel,
  MenuPositioner,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
} from "@ark-ui/react";
import type { ComponentChildren } from "preact";
import styles from "./Menu.module.css";

export type MenuItemConfig = {
  value: string;
  label: string;
  icon?: ComponentChildren;
  onSelect: () => void;
};

export type MenuEntry = MenuItemConfig | { type: "separator" };

type MenuProps = {
  trigger: ComponentChildren;
  label?: string;
  items: MenuEntry[];
};

export function Menu({ trigger, label, items }: MenuProps) {
  return (
    <MenuRoot>
      <MenuTrigger className={styles.trigger}>{trigger}</MenuTrigger>
      <MenuPositioner>
        <MenuContent className={styles.content}>
          <MenuItemGroup>
            {label && (
              <>
                <MenuItemGroupLabel className={styles.groupLabel}>{label}</MenuItemGroupLabel>
                <MenuSeparator className={styles.separator} />
              </>
            )}
            {items.map((entry, i) =>
              "type" in entry ? (
                <MenuSeparator key={i} className={styles.separator} />
              ) : (
                <MenuItem
                  key={entry.value}
                  value={entry.value}
                  className={`row centered gap-small ${styles.item}`}
                  onSelect={entry.onSelect}
                >
                  {entry.icon}
                  {entry.label}
                </MenuItem>
              ),
            )}
          </MenuItemGroup>
        </MenuContent>
      </MenuPositioner>
    </MenuRoot>
  );
}
