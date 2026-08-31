import type { SuggestionAffectedProducts } from "@/api/generated/models";
import { AffectedProductsTree } from "./AffectedProductsTree";

type Props = {
  affectedProducts: SuggestionAffectedProducts;
};

export function AffectedProductsList({ affectedProducts }: Props) {
  return <AffectedProductsTree affectedProducts={affectedProducts} />;
}
