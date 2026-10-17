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

/** The current local time as "HH:MM", the format time inputs use. */
export function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** "13:05" → "1:05 pm". */
export function formatTime(hhmm: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!match) return hhmm;
  const hours = Number(match[1]);
  return `${hours % 12 || 12}:${match[2]} ${hours < 12 ? "am" : "pm"}`;
}

/** Length of a bake, e.g. "3h 30m". An end before the start means it ran past midnight. */
export function formatDuration(start: string, end: string) {
  const minutes = (hhmm: string) => {
    const match = /^(\d{2}):(\d{2})$/.exec(hhmm);
    return match ? Number(match[1]) * 60 + Number(match[2]) : null;
  };
  const from = minutes(start);
  const to = minutes(end);
  if (from === null || to === null) return null;
  const total = (to - from + 24 * 60) % (24 * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

/** Short random id; works on plain-http LAN addresses where crypto.randomUUID doesn't. */
export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
