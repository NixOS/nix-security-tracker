import type { SuggestionCategorizedMaintainers } from "@/api/generated/models";
import { Maintainer } from "./Maintainer";

type Props = {
  suggestionId: number;
  categorizedMaintainers: SuggestionCategorizedMaintainers;
};

export function CategorizedMaintainersList({ suggestionId, categorizedMaintainers }: Props) {
  const { active, ignored, added } = categorizedMaintainers;
  return (
    <div className="column gap" data-testid={`suggestion-${suggestionId}-maintainers`}>
      <ul className="column gap-small">
        {active.map((m) => (
          <li key={m.github_id}>
            <Maintainer maintainer={m} />
          </li>
        ))}
      </ul>
      {ignored.length > 0 && (
        <details className="column gap">
          <summary className="text-l bold text-gray">Ignored maintainers</summary>
          <ul className="column gap-small">
            {ignored.map((m) => (
              <li key={m.github_id}>
                <Maintainer maintainer={m} />
              </li>
            ))}
          </ul>
        </details>
      )}
      {added.length > 0 && (
        <details className="column gap">
          <summary className="text-l bold text-gray">Additional maintainers</summary>
          <ul className="column gap-small">
            {added.map((m) => (
              <li key={m.github_id}>
                <Maintainer maintainer={m} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
