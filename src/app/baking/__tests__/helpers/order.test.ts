import { describe, expect, it } from "vitest";
import {
  dropIndex,
  effectiveCover,
  moveItem,
  sameOrder,
} from "@/lib/baking/order";

describe("moveItem", () => {
  const steps = ["mix", "rest", "shape", "bake"];

  it("moves an item down", () => {
    expect(moveItem(steps, 0, 2)).toEqual(["rest", "shape", "mix", "bake"]);
  });

  it("moves an item up", () => {
    expect(moveItem(steps, 3, 1)).toEqual(["mix", "bake", "rest", "shape"]);
  });

  it("clamps targets past either end", () => {
    expect(moveItem(steps, 1, 99)).toEqual(["mix", "shape", "bake", "rest"]);
    expect(moveItem(steps, 2, -5)).toEqual(["shape", "mix", "rest", "bake"]);
  });

  it("never changes the original list", () => {
    moveItem(steps, 0, 3);
    expect(steps).toEqual(["mix", "rest", "shape", "bake"]);
  });

  it("ignores an index that doesn't exist", () => {
    expect(moveItem(steps, 9, 0)).toEqual(steps);
  });
});

describe("dropIndex", () => {
  // Midpoints of the other rows, top to bottom.
  const mids = [100, 200, 300];

  it("drops above everything near the top", () => {
    expect(dropIndex(mids, 50)).toBe(0);
  });

  it("drops between rows", () => {
    expect(dropIndex(mids, 150)).toBe(1);
    expect(dropIndex(mids, 250)).toBe(2);
  });

  it("drops at the end below everything", () => {
    expect(dropIndex(mids, 999)).toBe(3);
  });
});

describe("sameOrder", () => {
  it("compares order, not just membership", () => {
    expect(sameOrder(["a", "b"], ["a", "b"])).toBe(true);
    expect(sameOrder(["a", "b"], ["b", "a"])).toBe(false);
    expect(sameOrder(["a"], ["a", "b"])).toBe(false);
  });
});

describe("effectiveCover", () => {
  const video = { id: "v", kind: "video" };
  const photo1 = { id: "p1", kind: "image" };
  const photo2 = { id: "p2", kind: "image" };

  it("uses the chosen cover", () => {
    expect(effectiveCover([video, photo1, photo2], "p2")).toBe(photo2);
  });

  it("falls back to the first photo, skipping videos", () => {
    expect(effectiveCover([video, photo1, photo2], null)).toBe(photo1);
  });

  it("falls back when the chosen cover was deleted", () => {
    expect(effectiveCover([video, photo1], "gone")).toBe(photo1);
  });

  it("uses a video only when there are no photos", () => {
    expect(effectiveCover([video], null)).toBe(video);
    expect(effectiveCover([], null)).toBeUndefined();
  });
});
