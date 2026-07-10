import type { SuggestionAffectedProducts } from "@/api/generated/models";
import { AffectedProduct } from "./AffectedProduct";

type Props = {
  affectedProducts: SuggestionAffectedProducts;
};

export function AffectedProductsList({ affectedProducts }: Props) {
  return (
    <ul className="column gap">
      {Object.entries(affectedProducts).map(([name, product]) => (
        <li key={`${name}-${product}`}>
          <AffectedProduct product={product} />
        </li>
      ))}
    </ul>
  );
}
