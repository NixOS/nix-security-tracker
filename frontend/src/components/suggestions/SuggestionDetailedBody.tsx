import type { Suggestion as SuggestionType } from "@/api/generated/models";
import { AffectedProductsTree } from "./AffectedProductsTree";
import { CategorizedMaintainersList } from "./CategorizedMaintainersList";
import { CategorizedPackagesList } from "./CategorizedPackagesList";
import { CategorizedReferencesList } from "./CategorizedReferencesList";
import { Comment } from "./Comment";
import { SuggestionStatusActions } from "./SuggestionStatusActions";

type Props = {
  suggestion: SuggestionType;
  userCanEdit: boolean;
};

export function SuggestionDetailedBody({ suggestion, userCanEdit }: Props) {
  const {
    id,
    status,
    comment,
    in_issue_draft,
    affected_products,
    packages,
    original_packages,
    ignored_packages,
    categorized_maintainers,
    categorized_url_references,
  } = suggestion;

  const editable = userCanEdit && (status === "pending" || status === "accepted");

  return (
    <>
      <div className="column gap">
        {/* References */}
        {categorized_url_references.original.length > 0 && (
          <CategorizedReferencesList
            categorizedReferences={categorized_url_references}
            suggestionId={id}
            editable={editable}
          />
        )}

        {/* Affected products */}
        {affected_products.length > 0 && (
          <AffectedProductsTree affectedProducts={affected_products} />
        )}

        {/* Packages */}
        {Object.keys(packages).length + Object.keys(ignored_packages).length > 0 && (
          <CategorizedPackagesList
            suggestionId={id}
            original={original_packages}
            active={packages}
            ignored={ignored_packages}
            editable={editable}
          />
        )}

        {/* Maintainers */}
        {categorized_maintainers.original.length > 0 && (
          <CategorizedMaintainersList
            suggestionId={id}
            categorizedMaintainers={categorized_maintainers}
            editable={editable}
          />
        )}

        {/* Comment */}
        {(comment || userCanEdit) && (
          <Comment suggestionId={id} comment={comment ?? null} canEdit={userCanEdit} />
        )}
      </div>

      {/* Change status */}
      {userCanEdit && (
        <SuggestionStatusActions
          suggestionId={id}
          status={status}
          comment={comment}
          inIssueDraft={in_issue_draft}
        />
      )}
    </>
  );
}
