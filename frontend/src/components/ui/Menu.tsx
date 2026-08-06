import {
  MenuContent,
  MenuItem,
  MenuItemGroup,
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
  disabled?: boolean;
};

export type MenuEntry = MenuItemConfig | { type: "separator" };

type MenuProps = {
  trigger: ComponentChildren;
  items: MenuEntry[];
};

export function Menu({ trigger, items }: MenuProps) {
  return (
    <MenuRoot>
      <MenuTrigger className={styles.trigger}>{trigger}</MenuTrigger>
      <MenuPositioner>
        <MenuContent
          className={`rounded border box compact shadow bg-white text-black ${styles.content}`}
        >
          <MenuItemGroup>
            {items.map((entry, i) =>
              "type" in entry ? (
                <MenuSeparator key={i} className={styles.separator} />
              ) : (
                <MenuItem
                  key={entry.value}
                  value={entry.value}
                  className={`row centered gap-small ${!entry.disabled && "cursor-pointer"} ${styles.item}`}
                  onSelect={entry.onSelect}
                  disabled={entry.disabled}
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
