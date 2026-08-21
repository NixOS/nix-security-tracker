import { TabList, TabsRoot, TabTrigger } from "@ark-ui/react";
import { GlobeCheckIcon, ShieldIcon } from "lucide-preact";
import { useLocation } from "wouter-preact";
import styles from "./NavTabs.module.css";

type NavTab = "suggestions" | "issues";

function getActiveTab(path: string): NavTab | "" {
  if (path.startsWith("/ui-v2/suggestions")) return "suggestions";
  if (path.startsWith("/ui-v2/issues")) return "issues";
  return "";
}

export function NavTabs() {
  const [location, setLocation] = useLocation();
  const value = getActiveTab(location);

  return (
    <TabsRoot
      value={value}
      onValueChange={({ value }) => setLocation(`/ui-v2/${value}`)}
      className={styles.tabsRoot}
    >
      <TabList className={`row ${styles.tabList}`}>
        <TabTrigger value="suggestions" className={`column centered ${styles.tab} cursor-pointer`}>
          <ShieldIcon size="1.5em" />
          <span className="no-line-breaks">Suggestions</span>
        </TabTrigger>
        <TabTrigger value="issues" className={`column centered ${styles.tab} cursor-pointer`}>
          <GlobeCheckIcon size="1.5em" />
          <span className="no-line-breaks">Nixpkgs Issues</span>
        </TabTrigger>
      </TabList>
    </TabsRoot>
  );
}
