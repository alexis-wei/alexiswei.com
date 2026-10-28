import { describe, expect, it } from "vitest";
import {
  formatDuration,
  safeHref,
  toDateTime,
  withoutUnit,
  withUnit,
} from "@/lib/baking/format";

describe("safeHref", () => {
  it("keeps http(s) links", () => {
    expect(safeHref("https://example.com/recipe")).toBe(
      "https://example.com/recipe",
    );
    expect(safeHref("http://example.com")).toBe("http://example.com/");
  });

  it("adds https:// when there's no scheme", () => {
    expect(safeHref("example.com/recipes/rye")).toBe(
      "https://example.com/recipes/rye",
    );
  });

  it("refuses anything that isn't http(s)", () => {
    expect(safeHref("javascript:alert(1)")).toBeNull();
    expect(safeHref("JavaScript:alert(1)")).toBeNull();
    expect(safeHref("data:text/html,<b>hi</b>")).toBeNull();
    expect(safeHref("")).toBeNull();
    expect(safeHref("   ")).toBeNull();
  });
});

describe("bake start/end", () => {
  it("reads old time-only values as that time on the log's date", () => {
    expect(toDateTime("09:40", "2026-10-15")).toBe("2026-10-15T09:40");
  });

  it("measures multi-day bakes", () => {
    expect(
      formatDuration("2026-10-15T20:00", "2026-10-17T09:15", "2026-10-15"),
    ).toBe("1d 13h 15m");
  });

  it("treats an old end-before-start as running past midnight", () => {
    expect(formatDuration("23:30", "01:15", "2026-10-15")).toBe("1h 45m");
  });
});

describe("withUnit", () => {
  it("adds the unit to a plain number", () => {
    expect(withUnit("24", "°C")).toBe("24°C");
    expect(withUnit(" 48.5 ", "%")).toBe("48.5%");
    expect(withUnit("-2", "°C")).toBe("-2°C");
  });

  it("leaves readings that already say something else alone", () => {
    expect(withUnit("48%", "%")).toBe("48%");
    expect(withUnit("75F", "°F")).toBe("75F");
    expect(withUnit("warm", "°C")).toBe("warm");
  });
});

describe("withoutUnit", () => {
  it("drops the unit the reading box already shows", () => {
    expect(withoutUnit("23°C", "°C")).toBe("23");
    expect(withoutUnit("23 c", "°C")).toBe("23");
    expect(withoutUnit("48%", "%")).toBe("48");
    expect(withoutUnit("205F", "°F")).toBe("205");
  });

  it("keeps anything that isn't a number with that unit", () => {
    expect(withoutUnit("24", "°C")).toBe("24");
    expect(withoutUnit("75F", "°C")).toBe("75F");
    expect(withoutUnit("warm", "°C")).toBe("warm");
    expect(withoutUnit("", "%")).toBe("");
  });
});
