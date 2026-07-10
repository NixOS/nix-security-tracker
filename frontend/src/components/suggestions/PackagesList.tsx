import type { SuggestionPackages } from "@/api/generated/models";
import { Package } from "./Package";

type Props = {
  packages: SuggestionPackages;
};

export function PackagesList({ packages }: Props) {
  return (
    <ul className="column dividers">
      {Object.entries(packages).map(([attr, pkg]) => (
        <li key={attr}>
          <Package key={attr} attr={attr} pkg={pkg} />
        </li>
      ))}
    </ul>
  );
}
