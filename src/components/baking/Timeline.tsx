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
        {steps.map((step) => (
          <li key={step.id} className="relative pb-5 last:pb-0">
            <span className="absolute top-[0.6rem] -left-[23.5px] size-[7px] rounded-full border border-black/60 bg-white" />
            {step.time && (
              <p className="font-mono text-xs text-black/45">{step.time}</p>
            )}
            <p className="leading-relaxed whitespace-pre-wrap">{step.text}</p>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div>
      <ol className="divide-y divide-black/10 border-black/10 empty:hidden [&:not(:empty)]:border-y">
        {steps.map((step) => (
          <li key={step.id} className="flex items-start gap-3 py-2.5">
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
