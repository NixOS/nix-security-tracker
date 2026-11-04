import { PackageIcon, RssIcon } from "lucide-preact";
import { useRef } from "preact/hooks";
import { useGetPackageExists } from "@/api/generated/endpoints";
import { FilterPill, filterInputClass } from "@/components/ui/FilterPill";
import { useDebouncedSync } from "@/hooks/useDebouncedSync";
import styles from "./PackageFilterInput.module.css";

type Props = {
  packageFilter: string;
  setPackageFilter: (value: string) => void;
};

export function PackageFilterInput({ packageFilter, setPackageFilter }: Props) {
  const { draft, setDraft, commitNow, pending } = useDebouncedSync(packageFilter, setPackageFilter);
  const inputRef = useRef<HTMLInputElement>(null);

  // A package can have no matching suggestions but still exist (and have a feed).
  // Existence is checked independently of search results.
  const { data: packageExistsResult } = useGetPackageExists(packageFilter, {
    query: { enabled: !!packageFilter },
  });
  const showFeed = !pending && !!packageFilter && packageExistsResult?.exists === true;

  return (
    <FilterPill
      icon={PackageIcon}
      active={draft !== ""}
      clearLabel="Clear package filter"
      onClear={() => {
        commitNow("");
        inputRef.current?.focus();
      }}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="Filter by matching package…"
        value={draft}
        onInput={(e) => setDraft(e.currentTarget.value)}
        className={`${filterInputClass} ${styles.input}`}
        aria-label="Filter by matching package"
      />
      {showFeed ? (
        <a
          href={`/feeds/package/${encodeURIComponent(packageFilter)}/`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Atom feed for package '${packageFilter}'`}
          className={styles.feed}
        >
          <RssIcon />
        </a>
      ) : (
        <span className={`${styles.feed} ${styles.hidden}`} aria-hidden="true">
          <RssIcon />
        </span>
      )}
    </FilterPill>
  );
}
