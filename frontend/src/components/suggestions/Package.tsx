import { PackageMinusIcon, PackagePlusIcon } from "lucide-preact";
import type { SuggestionAttrpath, SuggestionPackage } from "@/api/generated/models";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { InlineIcon } from "@/components/ui/InlineIcon";
import { usePackageMutation } from "@/hooks/usePackage";
import { useSuggestionListFilterHref, withPackageFilter } from "@/hooks/useSuggestionListFilters";
import { formatTime } from "@/utils/date";
import { FilterShortcut } from "./FilterShortcut";
import styles from "./Package.module.css";

type Props = {
  pkg: SuggestionPackage;
  suggestionId: number;
  editable: boolean;
  isIgnored: boolean;
};

function versionStatusClass(status: string | null): string {
  if (status === "affected") return "bg-red-light";
  if (status === "unaffected") return "bg-green-light";
  return "";
}

export function Package({ pkg, suggestionId, editable, isIgnored }: Props) {
  const mutation = usePackageMutation(suggestionId);
  const filterHref = useSuggestionListFilterHref();

  function handleClick() {
    mutation.mutate({
      id: suggestionId,
      data: { package_id: pkg.id, ignored: !isIgnored },
    });
  }

  return (
    <div className={`row gap align-start wrap`}>
      {editable && (
        <button
          type="button"
          className={`btn ${isIgnored ? "btn-green" : "btn-gray"}`}
          onClick={handleClick}
          disabled={mutation.isPending}
        >
          <InlineIcon icon={isIgnored ? PackagePlusIcon : PackageMinusIcon} />
          {isIgnored ? "Restore" : "Ignore"}
        </button>
      )}
      <div className="column">
        <div className={`row gap-small ${styles.packageTitle}`}>
          <h3 className={`bold ${styles.packageTitle}`}>
            {pkg.homepage ? <ExternalLink href={pkg.homepage}>{pkg.name}</ExternalLink> : pkg.name}
          </h3>
          <FilterShortcut
            href={filterHref(withPackageFilter(pkg.name))}
            label={`Filter suggestions by package '${pkg.name}'`}
          />
        </div>
        <p className={`${styles.packageTitle}`}>{pkg.description}</p>
      </div>

      <div className="column gap">
        {pkg.attrpaths.map((attrpath) => (
          <Attrpath key={attrpath.attrpath} attrpath={attrpath} />
        ))}
      </div>
    </div>
  );
}

function Attrpath({ attrpath }: { attrpath: SuggestionAttrpath }) {
  return (
    <div className="column gap-small">
      <h4 className="bold">{attrpath.attrpath}</h4>
      {Object.keys(attrpath.branches).length > 0 && (
        <ul className={`column gap-small ${styles.details}`}>
          {Object.entries(attrpath.branches).map(([branch, info]) => (
            <li key={branch} className="inline-row gap-small">
              <span className={styles.branch}>{branch}</span>
              {info.version ? (
                info.src_position ? (
                  <ExternalLink
                    className={versionStatusClass(info.status)}
                    href={info.src_position}
                    title={info.updated ? `Evaluated: ${formatTime(info.updated)}` : undefined}
                  >
                    {info.version}
                  </ExternalLink>
                ) : (
                  <span className={versionStatusClass(info.status)}>{info.version}</span>
                )
              ) : (
                <span className="dimmed">—</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
