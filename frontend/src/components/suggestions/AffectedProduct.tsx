import type { SuggestionAffectedProduct } from "@/api/generated/models";

type Props = {
  product: SuggestionAffectedProduct;
};

export function AffectedProduct({ product }: Props) {
  return (
    <div
      className="row gap-small row-gap wrap"
      title={product.cpes.length > 0 ? product.cpes.join("\n") : "No CPE info"}
    >
      <div>{product.name}</div>
      <ul className="row gap-small wrap">
        {product.version_constraints.map(([op, ver]) => (
          <li
            key={`${op}${ver}`}
            className={
              op === "affected" ? "bg-red-light" : op === "unaffected" ? "bg-green-light" : ""
            }
            title={op}
          >
            {ver}
          </li>
        ))}
      </ul>
    </div>
  );
}
