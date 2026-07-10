import type { SuggestionCategorizedUrlReferences } from "@/api/generated/models";
import { Reference } from "./Reference";

type Props = {
  categorizedReferences: SuggestionCategorizedUrlReferences;
};

export function CategorizedReferencesList({ categorizedReferences }: Props) {
  const { active, ignored } = categorizedReferences;
  return (
    <div className="column gap">
      <ul className="column gap-small">
        {active.map((ref) => (
          <li key={ref.url}>
            <Reference reference={ref} />
          </li>
        ))}
      </ul>
      {ignored.length > 0 && (
        <details className="column gap">
          <summary className="text-l bold text-gray">Ignored references</summary>
          <ul className="column gap-small">
            {ignored.map((ref) => (
              <li key={ref.url}>
                <Reference reference={ref} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
