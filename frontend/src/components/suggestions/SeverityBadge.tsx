import type { Metric } from "@/api/generated/models";
import { Tooltip } from "../ui/Tooltip";
import styles from "./SeverityBadge.module.css";

function firstParsedMetric(metrics: readonly Metric[]): Metric | null {
  return metrics.find((m) => m.base_score !== null && m.base_severity !== null) ?? null;
}

export function SeverityBadge({ metrics }: { metrics: readonly Metric[] }) {
  const metric = firstParsedMetric(metrics);
  if (!metric || metric.base_score === null || metric.base_severity === null) return null;

  const score = metric.base_score.toFixed(1);
  const severity = metric.base_severity;

  return (
    <Tooltip
      content={
        <ul className="column">
          <li>
            CVSS version: <span className="bold">{metric.format}</span>
          </li>
          {metric.human_readable?.map(({ label, value }) => (
            <li key={label}>
              {label}: <span className="bold">{value}</span>
            </li>
          ))}
        </ul>
      }
    >
      <div className={`${styles.cvss} ${styles[`${severity}`]}`}>
        {score}&nbsp;{severity}
      </div>
    </Tooltip>
  );
}
