/** A calendar day in ISO `YYYY-MM-DD` form, as used by the API and URL parameters. */
export const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}
