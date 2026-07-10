import type { SuggestionPackages } from "@/api/generated/models";
import { PackagesList } from "./PackagesList";

type Props = {
  active: SuggestionPackages;
  ignored: SuggestionPackages;
};

export function CategorizedPackagesList({ active, ignored }: Props) {
  return (
    <div className="column gap">
      <PackagesList packages={active} />
      {Object.keys(ignored).length > 0 && (
        <details className="column gap">
          <summary className="text-l bold text-gray">Ignored packages</summary>
          <PackagesList packages={ignored} />
        </details>
      )}
    </div>
  );
}
