import type { SuggestionPackages } from "@/api/generated/models";
import { PackagesList } from "./PackagesList";

type Props = {
  suggestionId: number;
  active: SuggestionPackages;
  ignored: SuggestionPackages;
  editable: boolean;
};

export function CategorizedPackagesList({ suggestionId, active, ignored, editable }: Props) {
  return (
    <div className="column gap" data-testid={`suggestion-${suggestionId}-packages`}>
      <PackagesList
        packages={active}
        suggestionId={suggestionId}
        editable={editable}
        isIgnored={false}
      />
      {Object.keys(ignored).length > 0 && (
        <details className="column gap">
          <summary className="text-l bold text-gray">
            Ignored packages ({Object.keys(ignored).length})
          </summary>
          <PackagesList
            packages={ignored}
            suggestionId={suggestionId}
            editable={editable}
            isIgnored={true}
          />
        </details>
      )}
    </div>
  );
}
