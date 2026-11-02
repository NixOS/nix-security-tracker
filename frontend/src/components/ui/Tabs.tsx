import { TabContent, TabList, TabsRoot, TabTrigger } from "@ark-ui/react";
import type { LucideIcon } from "lucide-preact";
import type { ComponentChildren } from "preact";
import { InlineIcon } from "./InlineIcon";
import styles from "./Tabs.module.css";

export type Tab = {
  value: string;
  label: string;
  icon?: LucideIcon;
  content: ComponentChildren;
};

type TabsProps = {
  value: string;
  onValueChange: (value: string) => void;
  tabs: Tab[];
  compact?: boolean;
  lazyMount?: boolean;
};

export function Tabs({ value, onValueChange, tabs, lazyMount, compact = false }: TabsProps) {
  return (
    <TabsRoot
      value={value}
      onValueChange={({ value }) => onValueChange(value)}
      lazyMount={lazyMount}
      className={`column ${compact ? "gap" : "gap-big"}`}
    >
      <TabList className={`row ${styles.tabList}`}>
        {tabs.map((tab) => (
          <TabTrigger key={tab.value} value={tab.value} className={styles.tab}>
            {tab.icon && <InlineIcon icon={tab.icon} />}
            {tab.label}
          </TabTrigger>
        ))}
      </TabList>
      {tabs.map((tab) => (
        <TabContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabContent>
      ))}
    </TabsRoot>
  );
}
