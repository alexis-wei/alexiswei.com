"use client";

import { GripVertical, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  addStep,
  deleteStep,
  reorderSteps,
  updateStep,
} from "@/app/baking/actions";
import { nowDateTime, withoutUnit, withUnit } from "@/lib/baking/format";
import { dropIndex, moveItem, sameOrder } from "@/lib/baking/order";
import {
  resolveStepTimes,
  stepTimeLabels,
  stepGaps,
  type StepGap,
} from "@/lib/baking/timeline";
import type { Media, TimelineStep } from "@/lib/baking/types";
import { cn } from "@/lib/utils";
import { track, useAutosave } from "./autosave";
import { useLogState } from "./LogState";
import { MoreMenu } from "./MoreMenu";
import { StepPhotoPicker, StepPhotoStrip } from "./StepPhotos";
import { AutoTextarea, TextButton } from "./ui";

/**
 * A log's timeline. Each step has a date and time (bakes can span days) and
 * saves on its own. The time since the previous step is shown between steps.
 * Order is changed by dragging a step's handle (touch or mouse), or with ↑/↓
 * on the focused handle, and a forgotten step can be inserted after any other.
 */
export function Timeline({
  logId,
  logDate,
  editable,
}: {
  logId: string;
  logDate: string;
  editable: boolean;
}) {
  const { steps, setSteps, media, setMedia, linkMedia, arranging } =
    useLogState();
  const [busy, setBusy] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [pickingFor, setPickingFor] = useState<string | null>(null);
  const photosFor = (stepId: string) =>
    media.filter((m) => m.stepId === stepId);
  const rows = useRef(new Map<string, HTMLLIElement>());
  const dragStart = useRef<string[]>([]);

  const resolved = resolveStepTimes(
    steps.map((s) => s.time),
    logDate,
  );
  const gaps = stepGaps(resolved);

  if (!editable) {
    return (
      <ReadOnlyTimeline
        steps={steps}
        photosFor={photosFor}
        resolved={resolved}
        gaps={gaps}
        logDate={logDate}
      />
    );
  }

  const ids = () => steps.map((s) => s.id);

  async function insert(afterId: string | null) {
    setBusy(true);
    try {
      const step = await track(
        addStep(logId, afterId, { time: afterId ? "" : nowDateTime() }),
      );
      setSteps((list) => {
        const at = afterId ? list.findIndex((s) => s.id === afterId) + 1 : 0;
        return afterId
          ? [...list.slice(0, at), step, ...list.slice(at)]
          : [...list, step];
      });
      setFocusId(step.id);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    const before = steps;
    setSteps((list) => list.filter((s) => s.id !== id));
    // The step's photos stay in the gallery, unlinked (as on the server).
    setMedia((list) =>
      list.map((m) => (m.stepId === id ? { ...m, stepId: null } : m)),
    );
    try {
      await track(deleteStep(id));
    } catch {
      setSteps(before);
    }
  }

  async function saveOrder(next: TimelineStep[], previous: TimelineStep[]) {
    try {
      await track(
        reorderSteps(
          logId,
          next.map((s) => s.id),
        ),
      );
    } catch {
      setSteps(previous);
    }
  }

  function move(id: string, delta: number) {
    const from = steps.findIndex((s) => s.id === id);
    const to = from + delta;
    if (to < 0 || to >= steps.length) return;
    const next = moveItem(steps, from, to);
    setSteps(next);
    saveOrder(next, steps);
  }

  // Dragging: the list reorders live under the finger; the order is saved
  // once, on release, and only if it changed.
  function onDragStart(e: React.PointerEvent, id: string) {
    e.preventDefault();
    try {
      // Keeps move/up events coming to the handle while the finger leaves it.
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Not every pointer can be captured; dragging still works without it.
    }
    dragStart.current = ids();
    setDragId(id);
  }

  function onDragMove(e: React.PointerEvent) {
    if (!dragId) return;
    const others = steps.filter((s) => s.id !== dragId);
    const mids = others.map((s) => {
      const rect = rows.current.get(s.id)?.getBoundingClientRect();
      return rect ? rect.top + rect.height / 2 : 0;
    });
    const to = dropIndex(mids, e.clientY);
    const from = steps.findIndex((s) => s.id === dragId);
    if (to !== from) setSteps(moveItem(steps, from, to));
  }

  function onDragEnd() {
    if (!dragId) return;
    setDragId(null);
    if (!sameOrder(dragStart.current, ids())) {
      const previous = dragStart.current
        .map((id) => steps.find((s) => s.id === id))
        .filter((s): s is TimelineStep => Boolean(s));
      saveOrder(steps, previous);
    }
  }

  return (
    <div>
      <ol className="divide-y divide-black/10 border-black/10 empty:hidden [&:not(:empty)]:border-y">
        {steps.map((step, index) => (
          <StepRow
            key={step.id}
            step={step}
            arranging={arranging}
            photos={photosFor(step.id)}
            onPickPhotos={() => setPickingFor(step.id)}
            time={resolved[index]}
            gap={gaps[index]}
            index={index}
            count={steps.length}
            dragging={dragId === step.id}
            autoFocus={focusId === step.id}
            rowRef={(el) => {
              if (el) rows.current.set(step.id, el);
              else rows.current.delete(step.id);
            }}
            onChange={(next) =>
              setSteps((list) => list.map((s) => (s.id === next.id ? next : s)))
            }
            onDelete={() => remove(step.id)}
            onInsertAfter={() => insert(step.id)}
            onMove={(delta) => move(step.id, delta)}
            onDragStart={(e) => onDragStart(e, step.id)}
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
            busy={busy}
          />
        ))}
      </ol>
      {pickingFor && steps.some((s) => s.id === pickingFor) && (
        <StepPhotoPicker
          step={steps.find((s) => s.id === pickingFor)!}
          steps={steps}
          media={media}
          onToggle={(photo, attach) =>
            linkMedia(photo.id, attach ? pickingFor : null)
          }
          onClose={() => setPickingFor(null)}
        />
      )}
      <TextButton className="mt-3" disabled={busy} onClick={() => insert(null)}>
        + add step
      </TextButton>
    </div>
  );
}

function ReadOnlyTimeline({
  steps,
  photosFor,
  resolved,
  gaps,
  logDate,
}: {
  steps: TimelineStep[];
  photosFor: (stepId: string) => Media[];
  resolved: string[];
  gaps: (StepGap | null)[];
  logDate: string;
}) {
  const labels = stepTimeLabels(resolved, logDate);
  return (
    <ol className="relative border-l border-black/15 pl-5">
      {steps.map((step, index) => {
        const readings = [
          labels[index],
          step.roomTemp && `room ${withUnit(step.roomTemp, "°C")}`,
          step.humidity && `rh ${withUnit(step.humidity, "%")}`,
          step.internalTemp && `internal ${withUnit(step.internalTemp, "°F")}`,
        ].filter(Boolean);
        const gap = gaps[index];
        return (
          <li key={step.id} className="relative pb-5 last:pb-0">
            {gap && <GapLabel gap={gap} className="-mt-2 mb-2" />}
            <span className="absolute top-[0.6rem] -left-[23.5px] size-[7px] rounded-full border border-black/60 bg-white" />
            {readings.length > 0 && (
              <p className="font-mono text-[11px] text-black/45">
                {readings.join(" · ")}
              </p>
            )}
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {step.text}
            </p>
            <div className="mt-2 empty:hidden">
              <StepPhotoStrip photos={photosFor(step.id)} href />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** The time since the previous step, e.g. "1h 30m later". */
function GapLabel({ gap, className }: { gap: StepGap; className?: string }) {
  return (
    <p
      className={cn(
        "font-mono text-[10px] tracking-[0.06em]",
        gap.backwards ? "text-red-600/80" : "text-black/40",
        className,
      )}
      title={
        gap.backwards ? "This step is timed before the one above it" : undefined
      }
    >
      {gap.backwards
        ? `${gap.label} (before the step above)`
        : `${gap.label} later`}
    </p>
  );
}

function StepRow({
  step,
  arranging,
  photos,
  onPickPhotos,
  time,
  gap,
  index,
  count,
  dragging,
  autoFocus,
  busy,
  rowRef,
  onChange,
  onDelete,
  onInsertAfter,
  onMove,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  step: TimelineStep;
  arranging: boolean;
  photos: Media[];
  onPickPhotos: () => void;
  time: string; // resolved "YYYY-MM-DDTHH:MM", or ""
  gap: StepGap | null;
  index: number;
  count: number;
  dragging: boolean;
  autoFocus: boolean;
  busy: boolean;
  rowRef: (el: HTMLLIElement | null) => void;
  onChange: (step: TimelineStep) => void;
  onDelete: () => void;
  onInsertAfter: () => void;
  onMove: (delta: number) => void;
  onDragStart: (e: React.PointerEvent) => void;
  onDragMove: (e: React.PointerEvent) => void;
  onDragEnd: () => void;
}) {
  const { schedule, flush } = useAutosave((next: TimelineStep) =>
    updateStep(next.id, {
      time: next.time,
      text: next.text,
      roomTemp: next.roomTemp ?? "",
      humidity: next.humidity ?? "",
      internalTemp: next.internalTemp ?? "",
    }),
  );
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), 4000);
    return () => clearTimeout(timer);
  }, [confirming]);

  const patch = (change: Partial<TimelineStep>) => {
    const next = { ...step, ...change };
    onChange(next);
    schedule(next);
  };

  return (
    <li
      ref={rowRef}
      className={cn(
        "relative py-2.5 transition-colors",
        dragging && "z-10 bg-black/[0.03]",
      )}
    >
      {gap && (
        <GapLabel
          gap={gap}
          className="absolute -top-[7px] left-1/2 -translate-x-1/2 bg-white px-2 whitespace-nowrap"
        />
      )}
      <div className="flex items-center gap-2">
        {arranging && (
          <button
            type="button"
            aria-label={`Move step ${index + 1} of ${count}`}
            title="Drag to reorder (or use ↑/↓)"
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            onPointerCancel={onDragEnd}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                onMove(-1);
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                onMove(1);
              }
            }}
            className="-ml-1 mt-0.5 shrink-0 cursor-grab touch-none p-0.5 text-black/25 hover:text-black active:cursor-grabbing"
          >
            <GripVertical size={15} strokeWidth={1.25} />
          </button>
        )}
        <input
          type="datetime-local"
          value={time}
          onChange={(e) => patch({ time: e.target.value })}
          onBlur={flush}
          aria-label="Step date and time"
          className="w-[12.75rem] min-w-0 bg-transparent py-0.5 font-mono text-[13px] text-black/70 outline-none [&::-webkit-calendar-picker-indicator]:opacity-30"
        />
        {!time && (
          <button
            type="button"
            onClick={() => patch({ time: nowDateTime() })}
            className="shrink-0 font-mono text-[10px] tracking-[0.1em] text-black/45 uppercase hover:text-black"
          >
            now
          </button>
        )}
        <span className="flex-1" />
        <MoreMenu
          label={`More for step ${index + 1}`}
          align="right"
          items={[
            {
              label: "+ photo",
              ariaLabel: `Choose photos for step ${index + 1}`,
              onSelect: onPickPhotos,
            },
            {
              label: "+ step below",
              ariaLabel: `Insert a step after step ${index + 1}`,
              onSelect: onInsertAfter,
              disabled: busy,
            },
          ]}
        />
        {arranging &&
          (confirming ? (
            <button
              type="button"
              onClick={onDelete}
              className="mt-1 shrink-0 font-mono text-[10px] tracking-[0.1em] text-red-600 uppercase"
            >
              delete
            </button>
          ) : (
            <button
              type="button"
              aria-label="Remove step"
              onClick={() => setConfirming(true)}
              className="mt-1 shrink-0 text-black/30 hover:text-black"
            >
              <X size={16} strokeWidth={1.25} />
            </button>
          ))}
      </div>
      <AutoTextarea
        value={step.text}
        onChange={(e) => patch({ text: e.target.value })}
        onBlur={flush}
        autoFocus={autoFocus}
        placeholder="what happened"
        aria-label="Step"
        className={cn("mt-1 text-sm", arranging && "pl-6")}
      />
      <div className={cn("mt-2 empty:hidden", arranging && "pl-6")}>
        <StepPhotoStrip photos={photos} onOpen={onPickPhotos} />
      </div>
      {/* Readings wrap rather than overflow on narrow phones. */}
      <div
        className={cn(
          "mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1.5",
          arranging && "pl-6",
        )}
      >
        <Reading
          label="room"
          unit="°C"
          value={step.roomTemp}
          onChange={(roomTemp) => patch({ roomTemp })}
          onBlur={flush}
          aria-label="Room temperature at this step"
        />
        <Reading
          label="rh"
          unit="%"
          value={step.humidity}
          onChange={(humidity) => patch({ humidity })}
          onBlur={flush}
          aria-label="Humidity at this step"
        />
        <Reading
          label="internal"
          unit="°F"
          value={step.internalTemp}
          onChange={(internalTemp) => patch({ internalTemp })}
          onBlur={flush}
          aria-label="Internal temperature at this step"
        />
      </div>
    </li>
  );
}

/** A small labelled reading (room temp, humidity, internal temp) under a step. */
function Reading({
  label,
  unit,
  value,
  onChange,
  onBlur,
  "aria-label": ariaLabel,
}: {
  label: string;
  unit: string;
  value: string | undefined;
  onChange: (value: string) => void;
  onBlur: () => void;
  "aria-label": string;
}) {
  return (
    <label className="flex items-baseline gap-1.5">
      <span className="font-mono text-[9px] tracking-[0.1em] text-black/40 uppercase">
        {label}
      </span>
      <input
        value={withoutUnit(value ?? "", unit)}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder="—"
        inputMode="decimal"
        aria-label={ariaLabel}
        className="w-10 min-w-0 border-b border-black/10 bg-transparent font-mono text-[13px] text-black/70 outline-none placeholder:text-black/20 focus:border-black"
      />
      <span className="font-mono text-[11px] text-black/40">{unit}</span>
    </label>
  );
}

/**
 * "edit" / "done" beside the timeline heading: shows the steps' drag handles
 * and delete buttons only while arranging, to keep the timeline compact.
 */
export function TimelineEditToggle() {
  const { steps, arranging, setArranging } = useLogState();
  if (steps.length === 0 && !arranging) return null;
  return (
    <TextButton
      aria-pressed={arranging}
      onClick={() => setArranging((on) => !on)}
    >
      {arranging ? "done" : "edit"}
    </TextButton>
  );
}
