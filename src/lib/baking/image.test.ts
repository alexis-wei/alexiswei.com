import { describe, expect, it } from "vitest";
import { fit1080, fromSavedCrop, toSavedCrop } from "./image";

describe("fit1080 (photo and video upload size)", () => {
  it("shrinks a landscape 4K frame to 1920x1080", () => {
    expect(fit1080(3840, 2160)).toMatchObject({ width: 1920, height: 1080 });
  });

  it("keeps the short side at 1080 for portrait phone photos", () => {
    expect(fit1080(3024, 4032)).toMatchObject({ width: 1080, height: 1440 });
  });

  it("caps very long panoramas at 1920 on the long side", () => {
    const { width, height } = fit1080(8000, 2000);
    expect(width).toBe(1920);
    expect(height).toBe(480);
  });

  it("never upscales", () => {
    expect(fit1080(800, 600)).toEqual({ width: 800, height: 600, scale: 1 });
  });

  it("rounds to even sizes, which video encoders need", () => {
    const { width, height } = fit1080(4031, 3023);
    expect(width % 2).toBe(0);
    expect(height % 2).toBe(0);
  });
});

describe("saved ingredient crops", () => {
  const original = {
    naturalWidth: 3000,
    naturalHeight: 2000,
  } as HTMLImageElement;
  const shrunk = { naturalWidth: 720, naturalHeight: 480 } as HTMLImageElement;

  it("re-open the same framing on the smaller stored original", () => {
    // Framed on the full-size photo: image drawn 2 squares wide, shifted left.
    const crop = { x: -0.5, y: 0.1, scale: 2 / 3000 };
    const saved = toSavedCrop(crop, original);
    expect(saved).toEqual({ x: -0.5, y: 0.1, width: 2 });

    const reopened = fromSavedCrop(saved, shrunk);
    expect(reopened.x).toBe(-0.5);
    expect(reopened.y).toBe(0.1);
    // Same on-screen width, whatever the stored resolution.
    expect(reopened.scale * shrunk.naturalWidth).toBeCloseTo(2);
  });
});
