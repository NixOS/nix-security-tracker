import { PackageMinusIcon, PackagePlusIcon } from "lucide-preact";
import type { SuggestionPackage } from "@/api/generated/models";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { usePackageMutation } from "@/hooks/usePackage";
import { useSuggestionListFilterHref, withPackageFilter } from "@/hooks/useSuggestionListFilters";
import { formatTime } from "@/utils/date";
import { packageAttrpath } from "@/utils/package";
import { FilterShortcut } from "./FilterShortcut";
import { IgnoreRestoreButton } from "./IgnoreRestoreButton";
import styles from "./Package.module.css";
import { SuggestionItemRow } from "./SuggestionItemCollection";

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

  const attrpath = packageAttrpath(pkg);
  const attribute = attrpath.attrpath;

  function handleClick() {
    mutation.mutate({
      id: suggestionId,
      data: { package_attribute: attribute, ignored: !isIgnored },
    });
  }

  return (
    <SuggestionItemRow
      ignored={isIgnored}
      action={
        editable && (
          <IgnoreRestoreButton
            action={isIgnored ? "restore" : "ignore"}
            icon={isIgnored ? PackagePlusIcon : PackageMinusIcon}
            onClick={handleClick}
            disabled={mutation.isPending}
          />
        )
      }
    >
      <div className="row gap align-start wrap">
        <div className="column">
          <div className={`row gap-small ${styles.packageTitle}`}>
            <h3 className="bold">
              {pkg.homepage ? (
                <ExternalLink href={pkg.homepage}>{pkg.name}</ExternalLink>
              ) : (
                pkg.name
              )}
            </h3>
            <FilterShortcut
              href={filterHref(withPackageFilter(attribute))}
              label={`Filter suggestions by package '${attribute}'`}
            />
          </div>
          <p className={`${styles.packageTitle}`}>{pkg.description}</p>
        </div>

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
    </SuggestionItemRow>
  );
}
