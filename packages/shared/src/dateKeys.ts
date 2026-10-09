/**
 * Calendar keys for a stored timestamp, in the viewer's own time zone.
 * Transactions are stored as absolute instants (UTC). Grouping by
 * `occurred_at.slice(0, 7)` therefore uses the UTC month, so for someone in
 * Manila (UTC+8) anything logged between midnight and 8 AM local time on the 1st
 * landed in the previous month's totals. These helpers read the local calendar
 * date instead.
 */
const pad = (n: number) => String(n).padStart(2, "0");

/** "YYYY-MM" for the local month of an ISO timestamp. */
export function localMonthKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 7);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** "YYYY-MM-DD" for the local day of an ISO timestamp. */
export function localDateKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
