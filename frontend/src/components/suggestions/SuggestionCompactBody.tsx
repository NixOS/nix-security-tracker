import type { Suggestion as SuggestionType } from "@/api/generated/models";
import { AffectedProductsTree } from "./AffectedProductsTree";
import { CategorizedReferencesList } from "./CategorizedReferencesList";
import { SuggestionFooter } from "./SuggestionFooter";

type Props = {
  suggestion: SuggestionType;
  userCanEdit: boolean;
};

export function SuggestionCompactBody({ suggestion, userCanEdit }: Props) {
  const { id, status, affected_products, categorized_url_references } = suggestion;

  return (
    <div className="column gap-big">
      <div className="column gap">
        {categorized_url_references.original.length > 0 && (
          <CategorizedReferencesList
            categorizedReferences={categorized_url_references}
            suggestionId={id}
            editable={userCanEdit && (status === "pending" || status === "accepted")}
          />
        )}

        {affected_products.length > 0 && (
          <AffectedProductsTree affectedProducts={affected_products} />
        )}
      </div>

      <SuggestionFooter suggestion={suggestion} userCanEdit={userCanEdit} compact />
    </div>
  );
}
