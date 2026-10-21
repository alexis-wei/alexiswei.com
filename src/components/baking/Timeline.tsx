"use client";

import { GripVertical, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  addStep,
  deleteStep,
  reorderSteps,
  updateStep,
} from "@/app/baking/actions";
import { nowTime } from "@/lib/baking/format";
import { dropIndex, moveItem, sameOrder } from "@/lib/baking/order";
import type { TimelineStep } from "@/lib/baking/types";
import { cn } from "@/lib/utils";
import { track, useAutosave } from "./autosave";
import { AutoTextarea, TextButton } from "./ui";

/**
 * A log's timeline. Each step saves on its own; order is changed by dragging
 * a step's handle (touch or mouse), or with ↑/↓ on the focused handle, and a
 * forgotten step can be inserted right after any other.
 */
export function Timeline({
  logId,
  initial,
  editable,
}: {
  logId: string;
  initial: TimelineStep[];
  editable: boolean;
}) {
  const [steps, setSteps] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const rows = useRef(new Map<string, HTMLLIElement>());
  const dragStart = useRef<string[]>([]);

  if (!editable) return <ReadOnlyTimeline steps={steps} />;

  const ids = () => steps.map((s) => s.id);

  async function insert(afterId: string | null) {
    setBusy(true);
    try {
      const step = await track(
        addStep(logId, afterId, { time: afterId ? "" : nowTime() }),
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
      <TextButton className="mt-3" disabled={busy} onClick={() => insert(null)}>
        + add step
      </TextButton>
    </div>
  );
}

function ReadOnlyTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="relative border-l border-black/15 pl-5">
      {steps.map((step) => {
        const readings = [
          step.time,
          step.roomTemp && `room ${step.roomTemp}`,
          step.humidity && `rh ${step.humidity}`,
          step.internalTemp && `internal ${step.internalTemp}`,
        ].filter(Boolean);
        return (
          <li key={step.id} className="relative pb-5 last:pb-0">
            <span className="absolute top-[0.6rem] -left-[23.5px] size-[7px] rounded-full border border-black/60 bg-white" />
            {readings.length > 0 && (
              <p className="font-mono text-[11px] text-black/45">
                {readings.join(" · ")}
              </p>
            )}
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {step.text}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

function StepRow({
  step,
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
        "py-2.5 transition-colors",
        dragging && "relative z-10 bg-black/[0.03]",
      )}
    >
      <div className="flex items-start gap-2">
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
        <input
          type="time"
          value={step.time}
          onChange={(e) => patch({ time: e.target.value })}
          onBlur={flush}
          aria-label="Time"
          className="w-[6.75rem] shrink-0 bg-transparent py-0.5 font-mono text-sm text-black/70 outline-none [&::-webkit-calendar-picker-indicator]:opacity-30"
        />
        <AutoTextarea
          value={step.text}
          onChange={(e) => patch({ text: e.target.value })}
          onBlur={flush}
          autoFocus={autoFocus}
          placeholder="what happened"
          aria-label="Step"
          className="py-0.5 text-sm"
        />
        {confirming ? (
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
        )}
      </div>
      <div className="mt-1.5 flex items-center gap-5 pl-6">
        <Reading
          label="room"
          value={step.roomTemp}
          onChange={(roomTemp) => patch({ roomTemp })}
          onBlur={flush}
          aria-label="Room temperature at this step"
        />
        <Reading
          label="rh"
          value={step.humidity}
          onChange={(humidity) => patch({ humidity })}
          onBlur={flush}
          aria-label="Humidity at this step"
        />
        <Reading
          label="internal"
          value={step.internalTemp}
          onChange={(internalTemp) => patch({ internalTemp })}
          onBlur={flush}
          aria-label="Internal temperature at this step"
        />
        <button
          type="button"
          disabled={busy}
          onClick={onInsertAfter}
          aria-label={`Insert a step after step ${index + 1}`}
          title="Insert a step after this one"
          className="ml-auto flex items-center gap-1 font-mono text-[9px] tracking-[0.1em] text-black/35 uppercase hover:text-black disabled:opacity-40"
        >
          <Plus size={11} strokeWidth={1.25} /> step
        </button>
      </div>
    </li>
  );
}

/** A small labelled reading (room temp, humidity, internal temp) under a step. */
function Reading({
  label,
  value,
  onChange,
  onBlur,
  "aria-label": ariaLabel,
}: {
  label: string;
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
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder="—"
        inputMode="decimal"
        aria-label={ariaLabel}
        className="w-12 min-w-0 border-b border-black/10 bg-transparent font-mono text-[13px] text-black/70 outline-none placeholder:text-black/20 focus:border-black"
      />
    </label>
  );
}
