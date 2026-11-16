import type { SuggestionOriginalPackages, SuggestionPackages } from "@/api/generated/models";
import { Package } from "./Package";
import { SuggestionItemCollection } from "./SuggestionItemCollection";
import { SuggestionSectionHeading } from "./SuggestionSectionHeadings";
import { packageRows } from "./suggestionItems";

type Props = {
  suggestionId: number;
  original: SuggestionOriginalPackages;
  active: SuggestionPackages;
  ignored: SuggestionPackages;
  editable: boolean;
};

export function CategorizedPackagesList({
  suggestionId,
  original,
  active,
  ignored,
  editable,
}: Props) {
  return (
    <SuggestionItemCollection
      rows={packageRows(original, active, ignored)}
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
