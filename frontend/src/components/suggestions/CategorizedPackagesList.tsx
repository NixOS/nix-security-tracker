import type { SuggestionPackages } from "@/api/generated/models";
import { Package } from "./Package";
import { SuggestionItemCollection } from "./SuggestionItemCollection";
import { SuggestionSectionHeading } from "./SuggestionSectionHeadings";
import { packageRows } from "./suggestionItems";

type Props = {
  suggestionId: number;
  packages: SuggestionPackages;
  editable: boolean;
};

export function CategorizedPackagesList({ suggestionId, packages, editable }: Props) {
  return (
    <SuggestionItemCollection
      rows={packageRows(packages)}
      label={<SuggestionSectionHeading section="packages" />}
      testId={`suggestion-${suggestionId}-packages`}
      dividers
      renderRow={({ item, state }) => (
        <Package
          attr={item.attribute}
          pkg={item.pkg}
          suggestionId={suggestionId}
          editable={editable}
          isIgnored={state === "ignored"}
        />
      )}
    />
  );
}
