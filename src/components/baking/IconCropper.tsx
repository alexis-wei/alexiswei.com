"use client";

import { useEffect, useRef, useState } from "react";
import {
  containScale,
  renderCrop,
  type Crop,
  type CropSource,
  type PreparedImage,
} from "@/lib/baking/image";
import { Label, LineButton, TextButton } from "./ui";

type Point = { x: number; y: number };

// Zoom limits, relative to the scale where the whole image just fits.
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 12;

/** Zooms by `factor` while keeping the point `at` (square units) fixed in place. */
function zoomAround(crop: Crop, factor: number, at: Point, fit: number): Crop {
  const scale = Math.min(
    fit * MAX_ZOOM,
    Math.max(fit * MIN_ZOOM, crop.scale * factor),
  );
  const k = scale / crop.scale;
  return {
    scale,
    x: at.x - (at.x - crop.x) * k,
    y: at.y - (at.y - crop.y) * k,
  };
}

/**
 * Full-screen square crop step for ingredient images. Drag to move, pinch /
 * scroll / slider to zoom. Starts from the automatic trim-and-centre framing.
 */
export function IconCropper({
  source,
  onCancel,
  onDone,
}: {
  source: CropSource;
  onCancel: () => void;
  onDone: (icon: PreparedImage) => void;
}) {
  const { img, url, auto } = source;
  const fit = containScale(img);
  const [crop, setCrop] = useState(auto);
  const [busy, setBusy] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<{ crop: Crop; points: Point[] } | null>(null);
  const cropRef = useRef(crop);
  useEffect(() => {
    cropRef.current = crop;
  });

  // Pointer position in square units (0–1 across the frame).
  const toUnits = (e: { clientX: number; clientY: number }): Point => {
    const rect = frame.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  };

  // Each time a finger is added or lifted, restart the gesture from here.
  const restartGesture = () => {
    gesture.current = {
      crop: cropRef.current,
      points: [...pointers.current.values()],
    };
  };

  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, toUnits(e));
    const start = gesture.current;
    const now = [...pointers.current.values()];
    if (now.length === 1 && start.points.length === 1) {
      setCrop({
        ...start.crop,
        x: start.crop.x + now[0].x - start.points[0].x,
        y: start.crop.y + now[0].y - start.points[0].y,
      });
    } else if (now.length >= 2 && start.points.length >= 2) {
      const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
      const mid = (a: Point, b: Point) => ({
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
      });
      const [a0, b0] = start.points;
      const [a1, b1] = now;
      const m0 = mid(a0, b0);
      const m1 = mid(a1, b1);
      // Zoom around where the fingers started, then follow them as they move.
      const zoomed = zoomAround(
        start.crop,
        dist(a1, b1) / dist(a0, b0),
        m0,
        fit,
      );
      setCrop({
        ...zoomed,
        x: zoomed.x + m1.x - m0.x,
        y: zoomed.y + m1.y - m0.y,
      });
    }
  }

  function endPointer(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    restartGesture();
  }

  // Trackpad / mouse wheel zoom around the cursor. Needs a non-passive listener.
  useEffect(() => {
    const el = frame.current!;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const at = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
      setCrop((c) => zoomAround(c, Math.exp(-e.deltaY * 0.002), at, fit));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [fit]);

  useEffect(() => {
    // Capture phase, so Escape closes only the cropper and not a popup behind it.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onCancel();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onCancel]);

  // Slider works in log space so each step feels like the same amount of zoom.
  const zoom = Math.log2(crop.scale / fit);
  const centre = { x: 0.5, y: 0.5 };

  async function done() {
    setBusy(true);
    try {
      onDone(await renderCrop(img, crop));
    } catch {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Adjust image"
      className="fixed inset-0 z-[60] flex flex-col bg-white"
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-black/10 px-4 pt-[env(safe-area-inset-top)]">
        <Label>adjust image</Label>
        <button type="button" onClick={onCancel} className="-mr-1 p-1 text-sm">
          cancel
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-4 py-6">
        <div
          ref={frame}
          className="relative aspect-square w-full max-w-[min(420px,calc(100dvh-16rem))] cursor-grab touch-none overflow-hidden border border-black/20 bg-white select-none active:cursor-grabbing"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            pointers.current.set(e.pointerId, toUnits(e));
            restartGesture();
          }}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            draggable={false}
            className="pointer-events-none absolute max-w-none"
            style={{
              left: `${crop.x * 100}%`,
              top: `${crop.y * 100}%`,
              width: `${img.naturalWidth * crop.scale * 100}%`,
              height: `${img.naturalHeight * crop.scale * 100}%`,
            }}
          />
          {/* Padding guide matching the automatic framing. */}
          <div className="pointer-events-none absolute inset-[8%] border border-dashed border-black/10" />
        </div>

        <div className="flex w-full max-w-[420px] items-center gap-4">
          <Label>zoom</Label>
          <input
            type="range"
            min={Math.log2(MIN_ZOOM)}
            max={Math.log2(MAX_ZOOM)}
            step={0.01}
            value={zoom}
            onChange={(e) =>
              setCrop((c) =>
                zoomAround(
                  c,
                  (fit * 2 ** Number(e.target.value)) / c.scale,
                  centre,
                  fit,
                ),
              )
            }
            aria-label="Zoom"
            className="h-px min-w-0 flex-1 cursor-pointer appearance-none bg-black/20 accent-black [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:bg-white"
          />
          <TextButton onClick={() => setCrop(auto)}>auto</TextButton>
        </div>
        <p className="text-center text-xs text-black/40">
          drag to move · pinch or scroll to zoom
        </p>
      </div>

      <div className="shrink-0 border-t border-black/10 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <LineButton
          onClick={done}
          disabled={busy}
          className="mx-auto flex w-full max-w-[420px] justify-center"
        >
          {busy ? "saving…" : "use image"}
        </LineButton>
      </div>
    </div>
  );
}
