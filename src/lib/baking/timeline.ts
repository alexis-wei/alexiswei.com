// Timeline step times: resolving them to full dates, and the time between steps.
//
// Steps store "YYYY-MM-DDTHH:MM". Steps saved before multi-day timelines hold
// only "HH:MM"; they're read as that time on the log's date, rolling over to
// the next day whenever a time is earlier than the step before it (an
// overnight proof). Stored values are only rewritten when a step is edited.
//
// The gaps between steps are computed on render rather than stored: it's a
// handful of subtractions, and a stored value would go stale on every edit,
// insert or reorder.

import {
  DATE_TIME,
  formatMinutes,
  formatTime,
  shortDay,
  TIME_ONLY,
} from "./format";

const minutesOfDay = (hhmm: string) =>
  Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

function nextDay(day: string) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Each step's time as "YYYY-MM-DDTHH:MM", or "" when it has none. */
export function resolveStepTimes(times: readonly string[], logDate: string) {
  let day = /^\d{4}-\d{2}-\d{2}$/.test(logDate) ? logDate : "";
  let previous = -1;
  return times.map((time) => {
    if (DATE_TIME.test(time)) {
      const value = time.slice(0, 16);
      day = value.slice(0, 10);
      previous = minutesOfDay(value.slice(11));
      return value;
    }
    if (TIME_ONLY.test(time) && day) {
      const minutes = minutesOfDay(time);
      if (previous >= 0 && minutes < previous) day = nextDay(day);
      previous = minutes;
      return `${day}T${time}`;
    }
    return "";
  });
}

/** Minutes from `a` to `b` (both "YYYY-MM-DDTHH:MM"), or null if either is missing. */
export function minutesBetween(a: string, b: string) {
  if (!a || !b) return null;
  return (Date.parse(`${b}:00Z`) - Date.parse(`${a}:00Z`)) / 60000;
}

export type StepGap = { minutes: number; label: string; backwards: boolean };

/**
 * The time since the previous timed step, for each step (null for the first
 * timed step and for steps without a time). Untimed steps in between are
 * skipped, so the gap still measures from the last step that has a time.
 */
export function stepGaps(resolved: readonly string[]): (StepGap | null)[] {
  let last = "";
  return resolved.map((time) => {
    if (!time) return null;
    const minutes = last ? minutesBetween(last, time) : null;
    last = time;
    return minutes === null
      ? null
      : { minutes, label: formatMinutes(minutes), backwards: minutes < 0 };
  });
}

/** "9:40 pm", with the date when it differs from `sameDayAs` ("Oct 16, 9:40 pm"). */
export function formatStepTime(time: string, sameDayAs: string) {
  if (!time) return "";
  const day = time.slice(0, 10);
  const clock = formatTime(time.slice(11, 16));
  return day === sameDayAs ? clock : `${shortDay(day)}, ${clock}`;
}

/**
 * Display labels for a list of resolved step times: the date is included
 * whenever it differs from the previous timed step (the log's date for the
 * first one), so a multi-day timeline reads "9:40 pm … Oct 16, 7:30 am".
 */
export function stepTimeLabels(resolved: readonly string[], logDate: string) {
  let day = logDate;
  return resolved.map((time) => {
    const label = formatStepTime(time, day);
    if (time) day = time.slice(0, 10);
    return label;
  });
}
