import { PackageIcon, RssIcon, XIcon } from "lucide-preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { useGetPackageExists } from "@/api/generated/endpoints";
import styles from "./PackageFilterInput.module.css";

const DEBOUNCE_PACKAGE_MS = 500;

type Props = {
  packageFilter: string;
  setPackageFilter: (value: string) => void;
};

export function PackageFilterInput({ packageFilter, setPackageFilter }: Props) {
  const [local, setLocal] = useState(packageFilter);
  const inputRef = useRef<HTMLInputElement>(null);

  // Re-sync from the URL (e.g. back/forward navigation, external link).
  useEffect(() => setLocal(packageFilter), [packageFilter]);

  useEffect(() => {
    if (local === packageFilter) return;
    const timeout = setTimeout(() => setPackageFilter(local), DEBOUNCE_PACKAGE_MS);
    return () => clearTimeout(timeout);
  }, [local]);

  const active = local !== "";

  // A package can have no matching suggestions but still exist (and have a feed).
  // Existence is checked independently of search results.
  const { data: packageExistsResult } = useGetPackageExists(packageFilter, {
    query: { enabled: !!packageFilter },
  });
  const showFeed =
    local === packageFilter && !!packageFilter && packageExistsResult?.exists === true;

  return (
    <div
      className={`row centered gap-small bg-gray-light rounded-full ${styles.pill} ${active ? "bg-nixos-blue text-white" : ""}`}
    >
      <PackageIcon size="1em" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Filter by package…"
        value={local}
        onInput={(e) => setLocal(e.currentTarget.value)}
        className={styles.input}
        aria-label="Filter by package"
      />
      {showFeed ? (
        <a
          href={`/feeds/package/${encodeURIComponent(packageFilter)}/`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Atom feed for package '${packageFilter}'`}
          className={styles.feed}
        >
          <RssIcon size="1em" />
        </a>
      ) : (
        <span className={`${styles.feed} ${styles.hidden}`} aria-hidden="true">
          <RssIcon size="1em" />
        </span>
      )}
      <button
        type="button"
        className={`cursor-pointer ${styles.clear}`}
        aria-label="Clear package filter"
        disabled={!active}
        onClick={() => {
          setLocal("");
          setPackageFilter("");
          inputRef.current?.focus();
        }}
      >
        <XIcon size="1em" />
      </button>
    </div>
  );
}
