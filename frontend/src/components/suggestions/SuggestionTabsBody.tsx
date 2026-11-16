import { BugIcon, LinkIcon, PackageIcon, UserIcon } from "lucide-preact";
import { useState } from "preact/hooks";
import type { Suggestion as SuggestionType } from "@/api/generated/models";
import { type Tab, Tabs } from "@/components/ui/Tabs";
import { AffectedProductsTree } from "./AffectedProductsTree";
import { CategorizedMaintainersList } from "./CategorizedMaintainersList";
import { CategorizedPackagesList } from "./CategorizedPackagesList";
import { CategorizedReferencesList } from "./CategorizedReferencesList";
import { SuggestionFooter } from "./SuggestionFooter";

type Props = {
  suggestion: SuggestionType;
  userCanEdit: boolean;
};

export function SuggestionTabsBody({ suggestion, userCanEdit }: Props) {
  const {
    id,
    status,
    affected_products,
    packages,
    original_packages,
    ignored_packages,
    categorized_maintainers,
    categorized_url_references,
  } = suggestion;

  const editable = userCanEdit && (status === "pending" || status === "accepted");

  const tabs: (Tab | false)[] = [
    categorized_url_references.original.length > 0 && {
      value: "references",
      label: "References",
      icon: LinkIcon,
      content: (
        <CategorizedReferencesList
          categorizedReferences={categorized_url_references}
          suggestionId={id}
          editable={editable}
        />
      ),
    },
    affected_products.length > 0 && {
      value: "affected-products",
      label: "Affected products",
      icon: BugIcon,
      content: <AffectedProductsTree affectedProducts={affected_products} />,
    },
    Object.keys(packages).length + Object.keys(ignored_packages).length > 0 && {
      value: "packages",
      label: "Matching in Nixpkgs",
      icon: PackageIcon,
      content: (
        <CategorizedPackagesList
          suggestionId={id}
          original={original_packages}
          active={packages}
          ignored={ignored_packages}
          editable={editable}
        />
      ),
    },
    categorized_maintainers.original.length > 0 && {
      value: "maintainers",
      label: "Maintainers",
      icon: UserIcon,
      content: (
        <CategorizedMaintainersList
          suggestionId={id}
          categorizedMaintainers={categorized_maintainers}
          editable={editable}
        />
      ),
    },
  ];
  const populatedTabs = tabs.filter((tab): tab is Tab => Boolean(tab));

  const [activeTab, setActiveTab] = useState(populatedTabs[0]?.value);

  return (
    <div className="column gap-big" data-testid={`suggestion-${id}-tabs`}>
      {populatedTabs.length > 0 && (
        <Tabs
          value={activeTab ?? populatedTabs[0].value}
          onValueChange={setActiveTab}
          tabs={populatedTabs}
          compact
        />
      )}

      <SuggestionFooter suggestion={suggestion} userCanEdit={userCanEdit} compact />
    </div>
  );
}
