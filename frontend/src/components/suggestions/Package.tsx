import type { SuggestionPackage } from "@/api/generated/models";
import styles from "./Package.module.css";

type Props = {
  attr: string;
  pkg: SuggestionPackage;
};

function versionStatusClass(status: string | null): string {
  if (status === "affected") return "bg-red-light";
  if (status === "unaffected") return "bg-green-light";
  return "";
}

export function Package({ attr, pkg }: Props) {
  return (
    <div className={`row gap align-start wrap`}>
      <div className="column">
        <h3 className={`bold ${styles.packageTitle}`}>{attr}</h3>
        <p className={`${styles.packageTitle}`}>{pkg.description}</p>
      </div>

      {Object.keys(pkg.channels).length > 0 && (
        <ul className={`column gap-small ${styles.details}`}>
          {Object.entries(pkg.channels).map(([channel, info]) => (
            <li key={channel}>
              <details open={info.uniform_versions === false} class="details-marker-outside">
                <summary>
                  <span className="inline-row gap-small">
                    <span className={styles.channel}>{channel}</span>
                    {info.major_version ? (
                      info.src_position ? (
                        <a
                          className={versionStatusClass(info.status)}
                          href={info.src_position}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {info.major_version}
                        </a>
                      ) : (
                        <span className={versionStatusClass(info.status)}>
                          {info.major_version}
                        </span>
                      )
                    ) : (
                      <span className="dimmed">—</span>
                    )}
                  </span>
                </summary>
                {Object.keys(info.sub_branches).length > 0 && (
                  <ul className="column">
                    {Object.entries(info.sub_branches).map(([branch, binfo]) => (
                      <li key={branch} className="inline-row gap-small">
                        <span className={styles.branch}>{branch}</span>
                        {binfo.src_position ? (
                          <a
                            className={versionStatusClass(binfo.status)}
                            href={binfo.src_position}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {binfo.version}
                          </a>
                        ) : (
                          <span className={versionStatusClass(binfo.status)}>{binfo.version}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
