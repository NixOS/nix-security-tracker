import type { Suggestion as SuggestionType } from "@/api/generated/models";
import { AffectedProductsList } from "./AffectedProductsList";
import { CategorizedReferencesList } from "./CategorizedReferencesList";
import { Comment } from "./Comment";
import { SuggestionStatusActions } from "./SuggestionStatusActions";

type Props = {
  suggestion: SuggestionType;
  userCanEdit: boolean;
};

export function SuggestionCompactBody({ suggestion, userCanEdit }: Props) {
  const { id, status, comment, affected_products, categorized_url_references } = suggestion;

  return (
    <div className="column gap-big">
      <div className="column gap-small">
        {categorized_url_references.original.length > 0 && (
          <>
            <CategorizedReferencesList
              categorizedReferences={categorized_url_references}
              suggestionId={id}
              editable={userCanEdit && (status === "pending" || status === "accepted")}
            />
            <hr className="divider" />
          </>
        )}

        {Object.keys(affected_products).length > 0 && (
          <AffectedProductsList affectedProducts={affected_products} />
        )}
      </div>

      {comment && !userCanEdit && (
        <Comment suggestionId={id} comment={comment ?? null} canEdit={userCanEdit} compact />
      )}

      {userCanEdit && (
        <SuggestionStatusActions suggestionId={id} status={status} comment={comment}>
          <Comment suggestionId={id} comment={comment ?? null} canEdit={userCanEdit} compact />
        </SuggestionStatusActions>
      )}
    </div>
  );
}
