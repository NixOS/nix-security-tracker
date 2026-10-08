import type { Suggestion as SuggestionType } from "@/api/generated/models";
import { AffectedProductsTree } from "./AffectedProductsTree";
import { CategorizedReferencesList } from "./CategorizedReferencesList";
import { Comment } from "./Comment";
import { SuggestionStatusActions } from "./SuggestionStatusActions";

type Props = {
  suggestion: SuggestionType;
  userCanEdit: boolean;
};

export function SuggestionCompactBody({ suggestion, userCanEdit }: Props) {
  const { id, status, comment, in_issue_draft, affected_products, categorized_url_references } =
    suggestion;

  return (
    <div className="column gap-big">
      <div className="box compact column gap-small">
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

        {affected_products.length > 0 && (
          <AffectedProductsTree affectedProducts={affected_products} />
        )}
      </div>

      {comment && !userCanEdit && (
        <Comment suggestionId={id} comment={comment ?? null} canEdit={userCanEdit} compact />
      )}

      {userCanEdit && (
        <SuggestionStatusActions
          suggestionId={id}
          status={status}
          comment={comment}
          inIssueDraft={in_issue_draft}
        >
          <Comment suggestionId={id} comment={comment ?? null} canEdit={userCanEdit} compact />
        </SuggestionStatusActions>
      )}
    </div>
  );
}
