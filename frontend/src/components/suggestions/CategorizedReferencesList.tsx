import { LinkIcon } from "lucide-preact";
import type { SuggestionCategorizedUrlReferences } from "@/api/generated/models";
import { InlineIcon } from "@/components/ui/InlineIcon";
import { Reference } from "./Reference";
import { SuggestionItemCollection } from "./SuggestionItemCollection";
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
      label={
        <>
          <InlineIcon icon={LinkIcon} />
          References
        </>
      }
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
