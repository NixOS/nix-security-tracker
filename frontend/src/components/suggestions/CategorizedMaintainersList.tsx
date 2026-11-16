import type { SuggestionCategorizedMaintainers } from "@/api/generated/models";
import { Maintainer } from "./Maintainer";
import { MaintainerAddForm } from "./MaintainerAddForm";
import { SuggestionItemCollection } from "./SuggestionItemCollection";
import { SuggestionSectionHeading } from "./SuggestionSectionHeadings";
import { maintainerRows } from "./suggestionItems";

type Props = {
  suggestionId: number;
  categorizedMaintainers: SuggestionCategorizedMaintainers;
  editable: boolean;
};

export function CategorizedMaintainersList({
  suggestionId,
  categorizedMaintainers,
  editable,
}: Props) {
  return (
    <SuggestionItemCollection
      rows={maintainerRows(categorizedMaintainers)}
      label={<SuggestionSectionHeading section="maintainers" />}
      testId={`suggestion-${suggestionId}-maintainers`}
      renderRow={({ item, state }) => (
        <Maintainer
          maintainer={item}
          suggestionId={suggestionId}
          editable={editable}
          kind={state}
        />
      )}
      footer={editable && <MaintainerAddForm suggestionId={suggestionId} />}
    />
  );
}
