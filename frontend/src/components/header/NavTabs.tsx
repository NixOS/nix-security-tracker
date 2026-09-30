import { TabList, TabsRoot, TabTrigger } from "@ark-ui/react";
import { GlobeCheckIcon, ShieldIcon } from "lucide-preact";
import { useLocation } from "wouter-preact";
import styles from "./NavTabs.module.css";

type NavTab = "suggestions" | "issues";

function getActiveTab(path: string): NavTab | "" {
  if (path.startsWith("/suggestions")) return "suggestions";
  if (path.startsWith("/issues")) return "issues";
  return "";
}

export function NavTabs() {
  const [location, setLocation] = useLocation();
  const value = getActiveTab(location);

  return (
    <TabsRoot
      value={value}
      // NOTE(@florentc): onValueChange also takes keyboard navigation into account.
      // Not redundant with `onClick` on each tab
      onValueChange={({ value }) => setLocation(`/${value}`)}
      className={styles.tabsRoot}
    >
      <TabList className={`row ${styles.tabList}`}>
        <TabTrigger
          value="suggestions"
          // NOTE(@florentc): needed to force going back to list when browsing suggestion detail
          onClick={() => setLocation("/suggestions")}
          className={`column centered ${styles.tab} cursor-pointer`}
        >
          <ShieldIcon size="1.5em" />
          <span className="no-line-breaks">Suggestions</span>
        </TabTrigger>
        <TabTrigger
          value="issues"
          // NOTE(@florentc): needed to force going back to list when browsing issue detail
          onClick={() => setLocation("/issues")}
          className={`column centered ${styles.tab} cursor-pointer`}
        >
          <GlobeCheckIcon size="1.5em" />
          <span className="no-line-breaks">Nixpkgs Issues</span>
        </TabTrigger>
      </TabList>
    </TabsRoot>
  );
}
