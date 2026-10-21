import { describe, expect, it } from "vitest";
import {
  formatStepTime,
  minutesBetween,
  resolveStepTimes,
  stepGaps,
  stepTimeLabels,
} from "@/lib/baking/timeline";

describe("resolveStepTimes", () => {
  it("keeps full dates and times as they are", () => {
    expect(
      resolveStepTimes(["2026-10-15T20:00", "2026-10-17T08:00"], "2026-10-15"),
    ).toEqual(["2026-10-15T20:00", "2026-10-17T08:00"]);
  });

  it("puts older time-only steps on the log's date", () => {
    expect(resolveStepTimes(["09:00", "11:30"], "2026-10-15")).toEqual([
      "2026-10-15T09:00",
      "2026-10-15T11:30",
    ]);
  });

  it("rolls time-only steps to the next day when time goes backwards", () => {
    expect(resolveStepTimes(["21:00", "23:30", "07:00"], "2026-10-15")).toEqual(
      ["2026-10-15T21:00", "2026-10-15T23:30", "2026-10-16T07:00"],
    );
  });

  it("continues time-only steps from the date of a full one before them", () => {
    expect(
      resolveStepTimes(["2026-10-18T22:00", "06:00"], "2026-10-15"),
    ).toEqual(["2026-10-18T22:00", "2026-10-19T06:00"]);
  });

  it("leaves steps without a time empty", () => {
    expect(resolveStepTimes(["", "09:00"], "2026-10-15")).toEqual([
      "",
      "2026-10-15T09:00",
    ]);
  });
});

describe("stepGaps", () => {
  it("measures each step from the previous timed step", () => {
    const gaps = stepGaps([
      "2026-10-15T09:00",
      "",
      "2026-10-15T10:45",
      "2026-10-16T10:45",
    ]);
    expect(gaps.map((g) => g?.label ?? null)).toEqual([
      null,
      null,
      "1h 45m",
      "1d",
    ]);
  });

  it("flags a step timed before the one above it", () => {
    const [, gap] = stepGaps(["2026-10-15T10:00", "2026-10-15T09:40"]);
    expect(gap).toEqual({ minutes: -20, label: "−20m", backwards: true });
  });

  it("shows a zero gap as 0m", () => {
    expect(stepGaps(["2026-10-15T10:00", "2026-10-15T10:00"])[1]?.label).toBe(
      "0m",
    );
  });
});

describe("minutesBetween", () => {
  it("needs both times", () => {
    expect(minutesBetween("", "2026-10-15T10:00")).toBeNull();
    expect(minutesBetween("2026-10-15T09:00", "2026-10-15T10:30")).toBe(90);
  });
});

describe("formatStepTime", () => {
  it("shows just the time on the same day, and the date when it changes", () => {
    expect(formatStepTime("2026-10-15T21:40", "2026-10-15")).toBe("9:40 pm");
    expect(formatStepTime("2026-10-16T07:05", "2026-10-15")).toBe(
      "Oct 16, 7:05 am",
    );
    expect(formatStepTime("", "2026-10-15")).toBe("");
  });
});

describe("stepTimeLabels", () => {
  it("adds the date only when it changes from the step before", () => {
    expect(
      stepTimeLabels(
        [
          "2026-10-15T20:00",
          "2026-10-15T22:00",
          "",
          "2026-10-16T07:30",
          "2026-10-16T09:00",
        ],
        "2026-10-15",
      ),
    ).toEqual(["8:00 pm", "10:00 pm", "", "Oct 16, 7:30 am", "9:00 am"]);
  });

  it("shows the date on the first step when it isn't the log's day", () => {
    expect(stepTimeLabels(["2026-10-14T18:00"], "2026-10-15")).toEqual([
      "Oct 14, 6:00 pm",
    ]);
  });
});
