import { BugIcon, LinkIcon, PackageIcon, UserIcon } from "lucide-preact";
import { useState } from "preact/hooks";
import type { Suggestion as SuggestionType } from "@/api/generated/models";
import { type Tab, Tabs } from "@/components/ui/Tabs";
import { AffectedProductsList } from "./AffectedProductsList";
import { CategorizedMaintainersList } from "./CategorizedMaintainersList";
import { CategorizedPackagesList } from "./CategorizedPackagesList";
import { CategorizedReferencesList } from "./CategorizedReferencesList";
import { Comment } from "./Comment";
import { SuggestionStatusActions } from "./SuggestionStatusActions";

type Props = {
  suggestion: SuggestionType;
  userCanEdit: boolean;
};

export function SuggestionTabsBody({ suggestion, userCanEdit }: Props) {
  const {
    id,
    status,
    comment,
    affected_products,
    packages,
    ignored_packages,
    categorized_maintainers,
    categorized_url_references,
  } = suggestion;

  const editable = userCanEdit && (status === "pending" || status === "accepted");

  const tabs: (Tab | false)[] = [
    categorized_url_references.original.length > 0 && {
      value: "references",
      label: "References",
      icon: <LinkIcon size="1em" />,
      content: (
        <CategorizedReferencesList
          categorizedReferences={categorized_url_references}
          suggestionId={id}
          editable={editable}
        />
      ),
    },
    Object.keys(affected_products).length > 0 && {
      value: "affected-products",
      label: "Affected products",
      icon: <BugIcon size="1em" />,
      content: <AffectedProductsList affectedProducts={affected_products} />,
    },
    Object.keys(packages).length + Object.keys(ignored_packages).length > 0 && {
      value: "packages",
      label: "Matching in Nixpkgs",
      icon: <PackageIcon size="1em" />,
      content: (
        <CategorizedPackagesList
          suggestionId={id}
          active={packages}
          ignored={ignored_packages}
          editable={editable}
        />
      ),
    },
    categorized_maintainers.original.length > 0 && {
      value: "maintainers",
      label: "Maintainers",
      icon: <UserIcon size="1em" />,
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

      {comment && !userCanEdit && (
        <Comment suggestionId={id} comment={comment ?? null} canEdit={userCanEdit} compact />
      )}

      {userCanEdit && (
        <SuggestionStatusActions suggestionId={id} status={status} comment={comment}>
          <Comment suggestionId={id} comment={comment ?? null} canEdit={userCanEdit} compact />
        </SuggestionStatusActions>
      )}
    </div>
  );
}
