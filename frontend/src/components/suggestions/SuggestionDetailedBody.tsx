import type { Suggestion as SuggestionType } from "@/api/generated/models";
import { AffectedProductsList } from "./AffectedProductsList";
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
    affected_products,
    packages,
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
          <div className="rounded border box column gap">
            <h2 className="text-l bold text-gray">References</h2>
            <CategorizedReferencesList
              categorizedReferences={categorized_url_references}
              suggestionId={id}
              editable={editable}
            />
          </div>
        )}

        {/* Affected products */}
        {Object.keys(affected_products).length > 0 && (
          <div className="rounded border box column gap">
            <h2 className="text-l bold text-gray">Affected products</h2>
            <AffectedProductsList affectedProducts={affected_products} />
          </div>
        )}

        {/* Packages */}
        {Object.keys(packages).length + Object.keys(ignored_packages).length > 0 && (
          <div className="rounded border box column gap">
            <h2 className="text-l bold text-gray">Matching in nixpkgs</h2>
            <CategorizedPackagesList
              suggestionId={id}
              active={packages}
              ignored={ignored_packages}
              editable={editable}
            />
          </div>
        )}

        {/* Maintainers */}
        {categorized_maintainers.original.length > 0 && (
          <div className="rounded border box column gap">
            <h2 className="text-l bold text-gray">Maintainers</h2>
            <CategorizedMaintainersList
              suggestionId={id}
              categorizedMaintainers={categorized_maintainers}
              editable={editable}
            />
          </div>
        )}

        {/* Comment */}
        {(comment || userCanEdit) && (
          <Comment suggestionId={id} comment={comment ?? null} canEdit={userCanEdit} />
        )}
      </div>

      {/* Change status */}
      {userCanEdit && (
        <SuggestionStatusActions suggestionId={id} status={status} comment={comment} />
      )}
    </>
  );
}
