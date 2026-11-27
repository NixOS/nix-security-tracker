import type {
  PackageGroup,
  SuggestionOriginalPackages,
  SuggestionPackages,
} from "@/api/generated/models";
import { Package } from "./Package";
import { SuggestionItemCollection } from "./SuggestionItemCollection";
import { SuggestionSectionHeading } from "./SuggestionSectionHeadings";
import { ignoredRows, packageSlotRows } from "./suggestionItems";

type Props = {
  suggestionId: number;
  original: SuggestionOriginalPackages;
  active: SuggestionPackages;
  ignored: SuggestionPackages;
  groups: readonly PackageGroup[];
  editable: boolean;
};

export function CategorizedPackagesList({
  suggestionId,
  original,
  active,
  ignored,
  groups,
  editable,
}: Props) {
  const rows = packageSlotRows(original, active, ignored, groups);
  return (
    <SuggestionItemCollection
      rows={rows}
      label={<SuggestionSectionHeading section="packages" />}
      testId={`suggestion-${suggestionId}-packages`}
      dividers
      ignoredCount={ignoredRows(rows.flatMap((row) => row.item.attributes)).length}
      renderRow={({ item }, showIgnored) => (
        <Package
          slot={item}
          suggestionId={suggestionId}
          editable={editable}
          showIgnored={showIgnored}
        />
      )}
    />
  );
}
