"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { nowTime, uid } from "@/lib/baking/format";
import type { TimelineStep } from "@/lib/baking/types";
import { useAutosave } from "./autosave";
import { AutoTextarea, TextButton } from "./ui";

export function Timeline({
  initial,
  editable,
  onSave,
}: {
  initial: TimelineStep[];
  editable: boolean;
  onSave: (steps: TimelineStep[]) => Promise<unknown>;
}) {
  const [steps, setSteps] = useState(initial);
  const { schedule, flush } = useAutosave(onSave);

  const update = (next: TimelineStep[]) => {
    setSteps(next);
    schedule(next);
  };
  const patch = (id: string, change: Partial<TimelineStep>) =>
    update(steps.map((s) => (s.id === id ? { ...s, ...change } : s)));

  if (!editable) {
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
              <p className="leading-relaxed whitespace-pre-wrap">{step.text}</p>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <div>
      <ol className="divide-y divide-black/10 border-black/10 empty:hidden [&:not(:empty)]:border-y">
        {steps.map((step) => (
          <li key={step.id} className="py-2.5">
            <div className="flex items-start gap-3">
              <input
                type="time"
                value={step.time}
                onChange={(e) => patch(step.id, { time: e.target.value })}
                onBlur={flush}
                aria-label="Time"
                className="w-[7.75rem] shrink-0 bg-transparent py-0.5 font-mono text-base text-black/70 outline-none [&::-webkit-calendar-picker-indicator]:opacity-30"
              />
              <AutoTextarea
                value={step.text}
                onChange={(e) => patch(step.id, { text: e.target.value })}
                onBlur={flush}
                placeholder="what happened"
                aria-label="Step"
                className="py-0.5"
              />
              <button
                type="button"
                aria-label="Remove step"
                onClick={() => update(steps.filter((s) => s.id !== step.id))}
                className="mt-1 shrink-0 text-black/30 hover:text-black"
              >
                <X size={16} strokeWidth={1.25} />
              </button>
            </div>
            <div className="mt-1.5 flex gap-5">
              <Reading
                label="room"
                value={step.roomTemp}
                onChange={(roomTemp) => patch(step.id, { roomTemp })}
                onBlur={flush}
                aria-label="Room temperature at this step"
              />
              <Reading
                label="rh"
                value={step.humidity}
                onChange={(humidity) => patch(step.id, { humidity })}
                onBlur={flush}
                aria-label="Humidity at this step"
              />
              <Reading
                label="internal"
                value={step.internalTemp}
                onChange={(internalTemp) => patch(step.id, { internalTemp })}
                onBlur={flush}
                aria-label="Internal temperature at this step"
              />
            </div>
          </li>
        ))}
      </ol>
      <TextButton
        className="mt-3"
        onClick={() =>
          update([...steps, { id: uid(), time: nowTime(), text: "" }])
        }
      >
        + add step
      </TextButton>
    </div>
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
