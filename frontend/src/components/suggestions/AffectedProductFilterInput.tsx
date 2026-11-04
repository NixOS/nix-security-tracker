import { BugIcon } from "lucide-preact";
import { useRef } from "preact/hooks";
import { FilterPill, filterInputClass } from "@/components/ui/FilterPill";
import { useDebouncedSync } from "@/hooks/useDebouncedSync";
import styles from "./AffectedProductFilterInput.module.css";

type Props = {
  affectedProduct: string;
  affectedProductVersion: string;
  setAffectedProductFilter: (product: string, version: string) => void;
};

type Filter = { product: string; version: string };

const sameFilter = (a: Filter, b: Filter) => a.product === b.product && a.version === b.version;

export function AffectedProductFilterInput({
  affectedProduct,
  affectedProductVersion,
  setAffectedProductFilter,
}: Props) {
  const { draft, setDraft, commitNow } = useDebouncedSync(
    { product: affectedProduct, version: affectedProductVersion },
    ({ product, version }) => setAffectedProductFilter(product, version),
    { equals: sameFilter },
  );
  const productRef = useRef<HTMLInputElement>(null);

  return (
    <FilterPill
      icon={BugIcon}
      active={draft.product !== ""}
      clearLabel="Clear affected product filter"
      onClear={() => {
        commitNow({ product: "", version: "" });
        productRef.current?.focus();
      }}
    >
      <input
        ref={productRef}
        type="text"
        placeholder="Filter by affected product…"
        value={draft.product}
        onInput={(e) => {
          const product = e.currentTarget.value;
          setDraft({ product, version: product.trim() === "" ? "" : draft.version });
        }}
        className={`${filterInputClass} ${styles.product}`}
        aria-label="Filter by affected product"
      />
      {/* A version only narrows down an affected product, so it waits for one. */}
      <input
        type="text"
        placeholder="version…"
        value={draft.version}
        onInput={(e) => setDraft({ ...draft, version: e.currentTarget.value })}
        className={`${filterInputClass} ${styles.version}`}
        aria-label="Filter by affected product version"
        disabled={draft.product.trim() === ""}
      />
    </FilterPill>
  );
}
