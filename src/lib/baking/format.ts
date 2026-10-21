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

export const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
export const TIME_ONLY = /^\d{2}:\d{2}$/;

/**
 * A bake's start/end as "YYYY-MM-DDTHH:MM" (what datetime-local inputs use).
 * Logs saved before multi-day bakes stored only "HH:MM"; that means the time
 * on the log's date. Stored values aren't rewritten until they're edited.
 */
export function toDateTime(value: string, logDate: string) {
  if (DATE_TIME.test(value)) return value.slice(0, 16);
  if (TIME_ONLY.test(value) && /^\d{4}-\d{2}-\d{2}$/.test(logDate)) {
    return `${logDate}T${value}`;
  }
  return "";
}

/** The current local date and time as "YYYY-MM-DDTHH:MM". */
export function nowDateTime() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${nowTime()}`;
}

export const shortDay = (day: string) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  }).format(new Date(`${day}T00:00:00Z`));

/** Length of a bake, e.g. "3h 30m" or "1d 4h". */
export function formatDuration(start: string, end: string, logDate = "") {
  const from = toDateTime(start, logDate);
  const to = toDateTime(end, logDate);
  if (!from || !to) return null;
  let total = (Date.parse(`${to}:00Z`) - Date.parse(`${from}:00Z`)) / 60000;
  // Old time-only logs: an end before the start meant it ran past midnight.
  if (total < 0 && TIME_ONLY.test(start) && TIME_ONLY.test(end)) total += 1440;
  if (!(total >= 0)) return null;
  return formatMinutes(total);
}

/** 1530 → "1d 1h 30m"; negative values get a leading minus. */
export function formatMinutes(total: number) {
  const sign = total < 0 ? "−" : "";
  const abs = Math.abs(Math.round(total));
  const d = Math.floor(abs / 1440);
  const h = Math.floor((abs % 1440) / 60);
  const m = abs % 60;
  const parts = [d && `${d}d`, h && `${h}h`, m && `${m}m`].filter(Boolean);
  return sign + (parts.length ? parts.join(" ") : "0m");
}

/** "9:40 am → Oct 16, 1:10 pm": the date is shown when it isn't the log's day. */
export function formatSpan(start: string, end: string, logDate: string) {
  const part = (value: string) => {
    const dateTime = toDateTime(value, logDate);
    if (!dateTime) return "…";
    const [day, time] = dateTime.split("T");
    return day === logDate
      ? formatTime(time)
      : `${shortDay(day)}, ${formatTime(time)}`;
  };
  return `${part(start)} → ${part(end)}`;
}

/**
 * Capture time for a photo: "2:05 pm", or "Oct 16, 2:05 pm" when it was
 * taken on a different day than the log's date.
 */
export function formatTakenAt(stamp: string, logDate?: string) {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/.exec(stamp);
  if (!match) return null;
  const [, day, h, m] = match;
  const time = formatTime(`${h}:${m}`);
  if (!logDate || day === logDate) return time;
  return `${shortDay(day)}, ${time}`;
}

/**
 * A user-entered link made safe to put in an href: adds https:// when no
 * scheme is given, and returns null for anything but http(s) (so a pasted
 * "javascript:" link can never become clickable).
 */
export function safeHref(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return null;
  const withScheme = /^[a-z][a-z\d+.-]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const parsed = new URL(withScheme);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.href
      : null;
  } catch {
    return null;
  }
}

/** "https://www.site.com/recipes/x?utm=y" → "site.com/recipes/x". */
export function displayUrl(href: string) {
  const { host, pathname } = new URL(href);
  return host.replace(/^www\./, "") + (pathname === "/" ? "" : pathname);
}

/** Short random id; works on plain-http LAN addresses where crypto.randomUUID doesn't. */
export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
