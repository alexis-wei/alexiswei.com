import { describe, expect, it } from "vitest";
import { fromExif } from "./capture";

describe("fromExif (photo capture time)", () => {
  it("turns EXIF dates into the phone's clock time", () => {
    expect(fromExif("2026:10:17 14:05:03")).toBe("2026-10-17T14:05:03");
  });

  it("accepts a T separator", () => {
    expect(fromExif("2026:10:17T14:05:03")).toBe("2026-10-17T14:05:03");
  });

  it("ignores empty and placeholder dates", () => {
    expect(fromExif(undefined)).toBeNull();
    expect(fromExif("")).toBeNull();
    expect(fromExif("0000:00:00 00:00:00")).toBeNull();
    expect(fromExif("not a date")).toBeNull();
  });
});
