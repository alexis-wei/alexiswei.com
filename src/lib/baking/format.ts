/** "2026-10-15" → "Thu, Oct 15, 2026" (or "Oct 15, 2026" when short). */
export function formatDate(iso: string, short = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: short ? undefined : "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/** Short random id; works on plain-http LAN addresses where crypto.randomUUID doesn't. */
export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
