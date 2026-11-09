import { UserIcon } from "lucide-preact";
import type { SuggestionCategorizedMaintainers } from "@/api/generated/models";
import { InlineIcon } from "@/components/ui/InlineIcon";
import { Maintainer } from "./Maintainer";
import { MaintainerAddForm } from "./MaintainerAddForm";
import { SuggestionItemCollection } from "./SuggestionItemCollection";
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
      label={
        <>
          <InlineIcon icon={UserIcon} />
          Maintainers
        </>
      }
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
