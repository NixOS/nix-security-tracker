import { BugIcon, XIcon } from "lucide-preact";
import { useEffect, useRef, useState } from "preact/hooks";
import styles from "./AffectedProductFilterInput.module.css";

const DEBOUNCE_AFFECTED_PRODUCT_MS = 500;

type Props = {
  affectedProduct: string;
  affectedProductVersion: string;
  setAffectedProductFilter: (product: string, version: string) => void;
};

export function AffectedProductFilterInput({
  affectedProduct,
  affectedProductVersion,
  setAffectedProductFilter,
}: Props) {
  const [localProduct, setLocalProduct] = useState(affectedProduct);
  const [localVersion, setLocalVersion] = useState(affectedProductVersion);
  const productRef = useRef<HTMLInputElement>(null);

  // Re-sync from the URL (e.g. back/forward navigation, external link).
  useEffect(() => setLocalProduct(affectedProduct), [affectedProduct]);
  useEffect(() => setLocalVersion(affectedProductVersion), [affectedProductVersion]);

  useEffect(() => {
    if (localProduct === affectedProduct && localVersion === affectedProductVersion) return;
    const timeout = setTimeout(
      () => setAffectedProductFilter(localProduct, localVersion),
      DEBOUNCE_AFFECTED_PRODUCT_MS,
    );
    return () => clearTimeout(timeout);
  }, [localProduct, localVersion]);

  const active = localProduct !== "";

  return (
    <div
      className={`row centered gap-small bg-gray-light rounded-full ${styles.pill} ${active ? "bg-nixos-blue text-white" : ""}`}
    >
      <BugIcon />
      <input
        ref={productRef}
        type="text"
        placeholder="Filter by affected product…"
        value={localProduct}
        onInput={(e) => {
          const product = e.currentTarget.value;
          setLocalProduct(product);
          if (product.trim() === "") setLocalVersion("");
        }}
        className={styles.input}
        aria-label="Filter by affected product"
      />
      {/* A version only narrows down an affected product, so it waits for one. */}
      <input
        type="text"
        placeholder="version…"
        value={localVersion}
        onInput={(e) => setLocalVersion(e.currentTarget.value)}
        className={`${styles.input} ${styles.version}`}
        aria-label="Filter by affected product version"
        disabled={localProduct.trim() === ""}
      />
      <button
        type="button"
        className={`cursor-pointer ${styles.clear}`}
        aria-label="Clear affected product filter"
        disabled={!active}
        onClick={() => {
          setLocalProduct("");
          setLocalVersion("");
          setAffectedProductFilter("", "");
          productRef.current?.focus();
        }}
      >
        <XIcon />
      </button>
    </div>
  );
}
