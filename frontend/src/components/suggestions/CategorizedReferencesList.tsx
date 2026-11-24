import type { SuggestionUrlReferences } from "@/api/generated/models";
import { Reference } from "./Reference";
import { SuggestionItemCollection } from "./SuggestionItemCollection";
import { SuggestionSectionHeading } from "./SuggestionSectionHeadings";
import { referenceRows } from "./suggestionItems";

type Props = {
  references: SuggestionUrlReferences;
  suggestionId: number;
  editable: boolean;
};

export function CategorizedReferencesList({ references, suggestionId, editable }: Props) {
  return (
    <SuggestionItemCollection
      rows={referenceRows(references)}
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
