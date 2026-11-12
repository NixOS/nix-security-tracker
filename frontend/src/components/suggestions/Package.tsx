import { PackageMinusIcon, PackagePlusIcon } from "lucide-preact";
import type { SuggestionAttrpath, SuggestionPackage } from "@/api/generated/models";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { InlineIcon } from "@/components/ui/InlineIcon";
import { usePackageMutation } from "@/hooks/usePackage";
import { useSuggestionListFilterHref, withPackageFilter } from "@/hooks/useSuggestionListFilters";
import { formatTime } from "@/utils/date";
import { packageAttribute } from "@/utils/package";
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

  const attribute = packageAttribute(pkg);

  function handleClick() {
    if (attribute === undefined) return;
    mutation.mutate({
      id: suggestionId,
      data: { package_attribute: attribute, ignored: !isIgnored },
    });
  }

  return (
    <div className={`row gap align-start wrap`}>
      {editable && (
        <button
          type="button"
          className={`btn ${isIgnored ? "btn-green" : "btn-gray"}`}
          onClick={handleClick}
          disabled={mutation.isPending || attribute === undefined}
        >
          <InlineIcon icon={isIgnored ? PackagePlusIcon : PackageMinusIcon} />
          {isIgnored ? "Restore" : "Ignore"}
        </button>
      )}
      <div className="column">
        <div className={`row gap-small ${styles.packageTitle}`}>
          <h3 className={`bold ${styles.packageTitle}`}>
            {pkg.homepage ? (
              <ExternalLink href={pkg.homepage}>{attribute ?? pkg.name}</ExternalLink>
            ) : (
              (attribute ?? pkg.name)
            )}
          </h3>

          {attribute !== undefined && (
            <FilterShortcut
              href={filterHref(withPackageFilter(attribute))}
              label={`Filter suggestions by package '${attribute}'`}
            />
          )}
        </div>
        <p className={`${styles.packageTitle}`}>{pkg.description}</p>
      </div>

      {pkg.attribute && (
        <div className="column gap">
          <Attrpath attrpath={pkg.attribute} />
        </div>
      )}
    </div>
  );
}

function Attrpath({ attrpath }: { attrpath: SuggestionAttrpath }) {
  return (
    <div className="column gap-small">
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
