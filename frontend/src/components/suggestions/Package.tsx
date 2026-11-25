import { type LucideIcon, PackageMinusIcon, PackagePlusIcon } from "lucide-preact";
import type { SuggestionPackage } from "@/api/generated/models";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { useDeletePackageMutation, usePackageMutation } from "@/hooks/usePackage";
import { useSuggestionListFilterHref, withPackageFilter } from "@/hooks/useSuggestionListFilters";
import { formatTime } from "@/utils/date";
import { FilterShortcut } from "./FilterShortcut";
import { IgnoreRestoreButton } from "./IgnoreRestoreButton";
import styles from "./Package.module.css";
import { SuggestionItemRow } from "./SuggestionItemCollection";
import type { ItemState } from "./suggestionItems";

type Props = {
  attr: string;
  pkg: SuggestionPackage;
  suggestionId: number;
  editable: boolean;
  /** Which category this package is displayed in, and thus which action applies. */
  kind: ItemState;
};

function versionStatusClass(status: string | null): string {
  if (status === "affected") return "bg-red-light";
  if (status === "unaffected") return "bg-green-light";
  return "";
}

export function Package({ attr, pkg, suggestionId, editable, kind }: Props) {
  const ignoreRestoreMutation = usePackageMutation(suggestionId);
  const deleteMutation = useDeletePackageMutation(suggestionId);
  const filterHref = useSuggestionListFilterHref();

  const isIgnored = kind === "ignored";
  function handleClick() {
    switch (kind) {
      case "added":
        return deleteMutation.mutate({
          id: suggestionId,
          params: { package_attributes: [attr] },
        });
      case "active":
      case "ignored":
        return ignoreRestoreMutation.mutate({
          id: suggestionId,
          data: { package_attributes: [attr], ignored: !isIgnored },
        });
      default:
        kind satisfies never;
    }
  }

  const { action, icon, mutation } = (
    {
      active: { action: "ignore", icon: PackageMinusIcon, mutation: ignoreRestoreMutation },
      ignored: { action: "restore", icon: PackagePlusIcon, mutation: ignoreRestoreMutation },
      added: { action: "delete", icon: PackageMinusIcon, mutation: deleteMutation },
    } as const satisfies Record<
      ItemState,
      { action: string; icon: LucideIcon; mutation: { isPending: boolean } }
    >
  )[kind];

  return (
    <SuggestionItemRow
      ignored={isIgnored}
      action={
        editable && (
          <IgnoreRestoreButton
            action={action}
            icon={icon}
            onClick={handleClick}
            disabled={mutation.isPending}
          />
        )
      }
    >
      <div className="row gap align-start wrap">
        <div className="column">
          <div className={`row gap-small ${styles.packageTitle}`}>
            <h3 className="bold">{attr}</h3>
            <FilterShortcut
              href={filterHref(withPackageFilter(attr))}
              label={`Filter suggestions by package '${attr}'`}
            />
          </div>
          <p className={`${styles.packageTitle}`}>{pkg.description}</p>
        </div>

        {Object.keys(pkg.branches).length === 0 ? (
          // Only added packages can be in no tracked channel: matched ones come from the latest evaluations.
          kind === "added" && (
            <p className={`text-gray ${styles.details}`}>Not in any tracked channel</p>
          )
        ) : (
          <ul className={`column gap-small ${styles.details}`}>
            {Object.entries(pkg.branches).map(([branch, info]) => (
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
