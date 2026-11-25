import type { SuggestionMaintainers } from "@/api/generated/models";
import { Maintainer } from "./Maintainer";
import { MaintainerAddForm } from "./MaintainerAddForm";
import { SuggestionItemCollection } from "./SuggestionItemCollection";
import { SuggestionSectionHeading } from "./SuggestionSectionHeadings";
import { maintainerRows } from "./suggestionItems";

type Props = {
  suggestionId: number;
  maintainers: SuggestionMaintainers;
  editable: boolean;
};

export function CategorizedMaintainersList({ suggestionId, maintainers, editable }: Props) {
  return (
    <SuggestionItemCollection
      rows={maintainerRows(maintainers)}
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
