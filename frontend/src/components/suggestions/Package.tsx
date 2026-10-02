import { PackageMinusIcon, PackagePlusIcon } from "lucide-preact";
import type { SuggestionPackage } from "@/api/generated/models";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { usePackageMutation } from "@/hooks/usePackage";
import { formatTime } from "@/utils/date";
import styles from "./Package.module.css";

type Props = {
  attr: string;
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

export function Package({ attr, pkg, suggestionId, editable, isIgnored }: Props) {
  const mutation = usePackageMutation(suggestionId);

  function handleClick() {
    mutation.mutate({
      id: suggestionId,
      data: { package_attribute: attr, ignored: !isIgnored },
    });
  }

  return (
    <div className={`row gap align-start wrap`}>
      {editable && (
        <button
          type="button"
          className={`btn ${isIgnored ? "btn-green" : "btn-gray"} row gap-small centered`}
          onClick={handleClick}
          disabled={mutation.isPending}
        >
          {isIgnored ? <PackagePlusIcon size="1em" /> : <PackageMinusIcon size="1em" />}
          {isIgnored ? "Restore" : "Ignore"}
        </button>
      )}
      <div className="column">
        <h3 className={`bold ${styles.packageTitle}`}>{attr}</h3>
        <p className={`${styles.packageTitle}`}>{pkg.description}</p>
      </div>

      {Object.keys(pkg.branches).length > 0 && (
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
  );
}
