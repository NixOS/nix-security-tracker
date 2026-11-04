import type { SuggestionPackage } from "@/api/generated/models";
import { Package } from "./Package";

type Props = {
  packages: readonly SuggestionPackage[];
  suggestionId: number;
  editable: boolean;
  isIgnored: boolean;
};

export function PackagesList({ packages, suggestionId, editable, isIgnored }: Props) {
  return (
    <ul className="column dividers">
      {packages.map((pkg) => (
        <li key={pkg.id}>
          <Package
            pkg={pkg}
            suggestionId={suggestionId}
            editable={editable}
            isIgnored={isIgnored}
          />
        </li>
      ))}
    </ul>
  );
}
