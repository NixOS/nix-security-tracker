import { Link } from "wouter-preact";
import type { Suggestion as SuggestionType } from "@/api/generated/models";
import { useAuth } from "@/hooks/useAuth";
import { ActivityLog } from "./ActivityLog";
import { AffectedProductsList } from "./AffectedProductsList";
import { CategorizedMaintainersList } from "./CategorizedMaintainersList";
import { CategorizedPackagesList } from "./CategorizedPackagesList";
import { CategorizedReferencesList } from "./CategorizedReferencesList";
import { Comment } from "./Comment";
import { SeverityBadge } from "./SeverityBadge";
import { SuggestionStatus } from "./SuggestionStatus";

type Props = {
  suggestion: SuggestionType;
};

export function Suggestion({ suggestion }: Props) {
  const {
    id,
    cve_id,
    title,
    description,
    status,
    rejection_reason,
    comment,
    affected_products,
    packages,
    ignored_packages,
    metrics,
    categorized_maintainers,
    categorized_url_references,
  } = suggestion;

  const { user } = useAuth();
  const canEdit = Boolean(user?.is_committer || user?.is_admin);

  const nvdUrl = `https://nvd.nist.gov/vuln/detail/${encodeURIComponent(cve_id)}`;

  return (
    <article className="box shadow border rounded column gap-big">
      {/* Status + CVE ID + title */}
      <div className="column gap">
        <SuggestionStatus status={status} rejectionReason={rejection_reason} />

        <div className="row gap spread align-start">
          <div className="row gap">
            <Link href={`/ui-v2/suggestions/by-id/${id}`}>Permalink</Link>
            <a href={nvdUrl} target="_blank" rel="noreferrer">
              {cve_id}
            </a>
            {metrics.length > 0 && <SeverityBadge metrics={metrics} />}
          </div>
          <ActivityLog suggestionId={id} />
        </div>

        <details>
          <summary className="bold text-l">
            {title || (description ? `${description.slice(0, 80)}…` : cve_id)}
          </summary>
          {description && <p>{description}</p>}
        </details>
      </div>

      {/* References */}
      {categorized_url_references.active.length > 0 && (
        <div className="rounded border box column gap">
          <h2 className="text-l bold text-gray">References</h2>
          <CategorizedReferencesList categorizedReferences={categorized_url_references} />
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
      <div className="rounded border box column gap">
        <h2 className="text-l bold text-gray">Matching in nixpkgs</h2>
        <CategorizedPackagesList active={packages} ignored={ignored_packages} />
      </div>

      {/* Maintainers */}
      {categorized_maintainers.active.length > 0 && (
        <div className="rounded border box column gap">
          <h2 className="text-l bold text-gray">Maintainers</h2>
          <CategorizedMaintainersList categorizedMaintainers={categorized_maintainers} />
        </div>
      )}

      {/* Comment */}
      {(comment || canEdit) && (
        <Comment suggestionId={id} comment={comment ?? null} canEdit={canEdit} />
      )}
    </article>
  );
}
