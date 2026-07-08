import { TabContent, TabList, TabsRoot, TabTrigger } from "@ark-ui/react";
import type { ComponentChildren } from "preact";
import styles from "./Tabs.module.css";

type Tab = {
  value: string;
  label: string;
  icon?: ComponentChildren;
  content: ComponentChildren;
};

type TabsProps = {
  value: string;
  onValueChange: (value: string) => void;
  tabs: Tab[];
  lazyMount?: boolean;
};

export function Tabs({ value, onValueChange, tabs, lazyMount }: TabsProps) {
  return (
    <TabsRoot
      value={value}
      onValueChange={({ value }) => onValueChange(value)}
      lazyMount={lazyMount}
      className="column gap-big"
    >
      <TabList className={`row ${styles.tabList}`}>
        {tabs.map((tab) => (
          <TabTrigger
            key={tab.value}
            value={tab.value}
            className={`row gap-small centered ${styles.tab}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
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
