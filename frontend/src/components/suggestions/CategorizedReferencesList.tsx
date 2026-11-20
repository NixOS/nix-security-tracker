import type { SuggestionCategorizedUrlReferences } from "@/api/generated/models";
import { Reference } from "./Reference";
import { SuggestionItemCollection } from "./SuggestionItemCollection";
import { SuggestionSectionHeading } from "./SuggestionSectionHeadings";
import { referenceRows } from "./suggestionItems";

type Props = {
  categorizedReferences: SuggestionCategorizedUrlReferences;
  suggestionId: number;
  editable: boolean;
};

export function CategorizedReferencesList({
  categorizedReferences,
  suggestionId,
  editable,
}: Props) {
  return (
    <SuggestionItemCollection
      rows={referenceRows(categorizedReferences)}
      label={<SuggestionSectionHeading section="references" />}
      testId={`suggestion-${suggestionId}-references`}
      renderRow={({ item, state }) => (
        <Reference
          reference={item}
          suggestionId={suggestionId}
          editable={editable}
          isIgnored={state === "ignored"}
        />
      )}
    />
  );
}
