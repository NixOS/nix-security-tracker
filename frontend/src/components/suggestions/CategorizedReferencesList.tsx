import type { SuggestionCategorizedUrlReferences } from "@/api/generated/models";
import { Reference } from "./Reference";

type Props = {
  categorizedReferences: SuggestionCategorizedUrlReferences;
  suggestionId: number;
  editable: boolean;
};

export function CategorizedReferencesList({
  categorizedReferences,
  suggestionId,
  editable,
}: Props) {
  const { active, ignored } = categorizedReferences;
  return (
    <div className="column gap" data-testid={`suggestion-${suggestionId}-references`}>
      <ul className="column gap-small">
        {active.map((ref) => (
          <li key={ref.url}>
            <Reference
              reference={ref}
              suggestionId={suggestionId}
              editable={editable}
              isIgnored={false}
            />
          </li>
        ))}
      </ul>
      {ignored.length > 0 && (
        <details className="column gap">
          <summary className="text-l bold text-gray">Ignored references ({ignored.length})</summary>
          <ul className="column gap-small">
            {ignored.map((ref) => (
              <li key={ref.url}>
                <Reference
                  reference={ref}
                  suggestionId={suggestionId}
                  editable={editable}
                  isIgnored={true}
                />
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
