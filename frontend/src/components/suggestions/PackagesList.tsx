import type { SuggestionPackages } from "@/api/generated/models";
import { Package } from "./Package";

type Props = {
  packages: SuggestionPackages;
  suggestionId: number;
  editable: boolean;
  isIgnored: boolean;
};

export function PackagesList({ packages, suggestionId, editable, isIgnored }: Props) {
  return (
    <ul className="column dividers">
      {Object.entries(packages).map(([attr, pkg]) => (
        <li key={attr}>
          <Package
            key={attr}
            attr={attr}
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
