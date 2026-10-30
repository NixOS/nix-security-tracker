import type { SuggestionPackage } from "@/api/generated/models";
import { PackagesList } from "./PackagesList";

type Props = {
  suggestionId: number;
  active: readonly SuggestionPackage[];
  ignored: readonly SuggestionPackage[];
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
      {ignored.length > 0 && (
        <details className="column gap">
          <summary className="text-l bold text-gray">Ignored packages ({ignored.length})</summary>
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
