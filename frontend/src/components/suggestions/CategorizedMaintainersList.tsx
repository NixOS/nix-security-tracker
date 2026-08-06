import type { SuggestionCategorizedMaintainers } from "@/api/generated/models";
import { Maintainer } from "./Maintainer";

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
  const { active, ignored, added, orphan } = categorizedMaintainers;
  // Orphan maintainers (no longer associated with any active package) are kept in the data but hidden from display.
  const orphanIds = new Set(orphan.map((m) => m.github_id));
  const visibleActive = active.filter((m) => !orphanIds.has(m.github_id));
  const visibleIgnored = ignored.filter((m) => !orphanIds.has(m.github_id));
  return (
    <div className="column gap" data-testid={`suggestion-${suggestionId}-maintainers`}>
      <ul className="column gap-small">
        {visibleActive.map((m) => (
          <li key={m.github_id}>
            <Maintainer
              maintainer={m}
              suggestionId={suggestionId}
              editable={editable}
              isIgnored={false}
            />
          </li>
        ))}
      </ul>
      {visibleIgnored.length > 0 && (
        <details className="column gap">
          <summary className="text-l bold text-gray">
            Ignored maintainers ({visibleIgnored.length})
          </summary>
          <ul className="column gap-small">
            {visibleIgnored.map((m) => (
              <li key={m.github_id}>
                <Maintainer
                  maintainer={m}
                  suggestionId={suggestionId}
                  editable={editable}
                  isIgnored={true}
                />
              </li>
            ))}
          </ul>
        </details>
      )}
      {added.length > 0 && (
        <details className="column gap">
          <summary className="text-l bold text-gray">
            Additional maintainers ({added.length})
          </summary>
          <ul className="column gap-small">
            {added.map((m) => (
              <li key={m.github_id}>
                <Maintainer
                  maintainer={m}
                  suggestionId={suggestionId}
                  editable={false}
                  isIgnored={false}
                />
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
