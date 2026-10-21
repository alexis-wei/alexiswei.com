"use client";

import { Check } from "lucide-react";
import { resolveStepTimes, stepTimeLabels } from "@/lib/baking/timeline";
import type { Media, TimelineStep } from "@/lib/baking/types";
import { cn } from "@/lib/utils";
import { stepLabel } from "./LogState";
import { MediaThumb } from "./MediaThumb";
import { Sheet } from "./Sheet";

/** A step's attached photos as a row of small thumbnails. */
export function StepPhotoStrip({
  photos,
  onOpen,
  href,
}: {
  photos: Media[];
  /** Editing: tapping a thumbnail reopens the picker. */
  onOpen?: () => void;
  /** Reading: thumbnails open the full photo. */
  href?: boolean;
}) {
  if (photos.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Photos for this step">
      {photos.map((photo) => (
        <li key={photo.id}>
          {href ? (
            <a
              href={photo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block size-11 overflow-hidden bg-black/[0.03]"
            >
              <MediaThumb media={photo} sizes="44px" small />
            </a>
          ) : (
            <button
              type="button"
              onClick={onOpen}
              aria-label="Change this step's photos"
              className="relative block size-11 overflow-hidden bg-black/[0.03]"
            >
              <MediaThumb media={photo} sizes="44px" small />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * Picks which of the log's photos belong to a step. Tapping toggles; a photo
 * already on another step is labelled and moves here when picked (a photo
 * belongs to one step at a time).
 */
export function StepPhotoPicker({
  step,
  steps,
  media,
  onToggle,
  onClose,
}: {
  step: TimelineStep;
  steps: TimelineStep[];
  media: Media[];
  onToggle: (photo: Media, attach: boolean) => void;
  onClose: () => void;
}) {
  const number = steps.findIndex((s) => s.id === step.id) + 1;
  return (
    <Sheet title={`photos for step ${number}`} onClose={onClose}>
      {media.length === 0 ? (
        <p className="py-8 text-center text-sm text-black/40">
          no photos in this log yet. add some under photos &amp; videos first
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
          {media.map((photo) => {
            const attached = photo.stepId === step.id;
            const elsewhere = !attached && photo.stepId;
            return (
              <li key={photo.id}>
                <button
                  type="button"
                  aria-pressed={attached}
                  aria-label={`${attached ? "Remove" : "Add"} ${photo.kind}${photo.caption ? ` “${photo.caption}”` : ""}`}
                  onClick={() => onToggle(photo, !attached)}
                  className={cn(
                    "relative block aspect-square w-full overflow-hidden bg-black/[0.03] outline-offset-2",
                    attached && "outline outline-1 outline-black",
                  )}
                >
                  <MediaThumb media={photo} sizes="120px" />
                  {attached && (
                    <span className="absolute top-1 right-1 flex size-5 items-center justify-center bg-black text-white">
                      <Check size={12} strokeWidth={2} />
                    </span>
                  )}
                  {elsewhere && (
                    <span className="absolute inset-x-0 bottom-0 truncate bg-white/90 px-1.5 py-0.5 text-left font-mono text-[9px] tracking-[0.06em] text-black/60 uppercase">
                      {stepLabel(steps, photo.stepId)?.split(" · ")[0]}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Sheet>
  );
}

/** Picks the step a photo belongs to (or none), from the photo's side. */
export function PhotoStepPicker({
  photo,
  steps,
  logDate,
  onPick,
  onClose,
}: {
  photo: Media;
  steps: TimelineStep[];
  logDate: string;
  onPick: (stepId: string | null) => void;
  onClose: () => void;
}) {
  const times = stepTimeLabels(
    resolveStepTimes(
      steps.map((s) => s.time),
      logDate,
    ),
    logDate,
  );
  const option = (stepId: string | null, label: string, detail?: string) => {
    const selected = photo.stepId === stepId;
    return (
      <li key={stepId ?? "none"}>
        <button
          type="button"
          aria-pressed={selected}
          onClick={() => onPick(stepId)}
          className="flex w-full items-center gap-3 py-3 text-left"
        >
          <span
            className={cn(
              "flex size-4 shrink-0 items-center justify-center rounded-full border",
              selected ? "border-black bg-black text-white" : "border-black/25",
            )}
          >
            {selected && <Check size={10} strokeWidth={2.5} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm">{label}</span>
            {detail && (
              <span className="block truncate font-mono text-[10px] text-black/40">
                {detail}
              </span>
            )}
          </span>
        </button>
      </li>
    );
  };

  return (
    <Sheet title={`step for this ${photo.kind}`} onClose={onClose}>
      {steps.length === 0 ? (
        <p className="py-8 text-center text-sm text-black/40">
          no steps yet. add some to the timeline first
        </p>
      ) : (
        <ul className="divide-y divide-black/10">
          {option(null, "no step")}
          {steps.map((step, index) =>
            option(
              step.id,
              `step ${index + 1}${step.text.trim() ? ` · ${step.text.trim()}` : ""}`,
              times[index] || undefined,
            ),
          )}
        </ul>
      )}
    </Sheet>
  );
}
