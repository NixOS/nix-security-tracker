import type { SuggestionOriginalPackages, SuggestionPackages } from "@/api/generated/models";
import { Package } from "./Package";
import { PackageAddForm } from "./PackageAddForm";
import { SuggestionItemCollection } from "./SuggestionItemCollection";
import { SuggestionSectionHeading } from "./SuggestionSectionHeadings";
import { packageRows } from "./suggestionItems";

type Props = {
  suggestionId: number;
  original: SuggestionOriginalPackages;
  active: SuggestionPackages;
  ignored: SuggestionPackages;
  added: SuggestionPackages;
  unavailable: readonly string[];
  editable: boolean;
};

export function CategorizedPackagesList({
  suggestionId,
  original,
  active,
  ignored,
  added,
  unavailable,
  editable,
}: Props) {
  return (
    <SuggestionItemCollection
      rows={packageRows(original, active, ignored, added, unavailable)}
      label={<SuggestionSectionHeading section="packages" />}
      testId={`suggestion-${suggestionId}-packages`}
      dividers
      renderRow={({ item, state }) => (
        <Package
          attr={item.attribute}
          pkg={item.pkg}
          suggestionId={suggestionId}
          editable={editable}
          kind={state}
        />
      )}
      footer={editable && <PackageAddForm suggestionId={suggestionId} />}
    />
  );
}
