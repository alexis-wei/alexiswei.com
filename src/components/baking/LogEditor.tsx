"use client";

import { useState } from "react";
import { deleteLog, updateLog } from "@/app/baking/actions";
import {
  formatDate,
  formatDuration,
  formatSpan,
  nowDateTime,
  toDateTime,
} from "@/lib/baking/format";
import type { BakingLog, Ingredient, LogPatch } from "@/lib/baking/types";
import { track, useAutosave, useUnsavedChangesWarning } from "./autosave";
import { BackLink } from "./BakingHeader";
import { LogIngredients } from "./LogIngredients";
import { MediaGallery } from "./MediaGallery";
import { RecipeSection } from "./RecipeSection";
import { Timeline } from "./Timeline";
import {
  AutosaveText,
  Label,
  SaveIndicator,
  Section,
  ConfirmButton,
  TextButton,
  TextSection,
} from "./ui";

export function LogEditor({
  log,
  library,
  editable,
}: {
  log: BakingLog;
  library: Ingredient[];
  editable: boolean;
}) {
  useUnsavedChangesWarning();
  const save = (patch: LogPatch) => updateLog(log.id, patch);

  const hasIngredients = log.ingredients.length > 0;
  const show = (filled: boolean) => editable || filled;

  return (
    <article>
      <header className="sticky top-0 z-20 -mx-4 border-b border-black/10 bg-white/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="flex h-14 items-center justify-between">
          <BackLink href="/baking">logs</BackLink>
          {editable && <SaveIndicator />}
        </div>
      </header>

      <div className="pt-8 pb-6">
        {editable ? (
          <>
            <DateField
              initial={log.bakedOn}
              onSave={(bakedOn) => save({ bakedOn })}
            />
            <AutosaveText
              initial={log.title}
              onSave={(title) => save({ title })}
              singleLine
              placeholder="what did you bake?"
              aria-label="Title"
              className="mt-2 font-serif text-[28px] leading-tight"
            />
            <BakeTimes
              start={toDateTime(log.startTime, log.bakedOn)}
              end={toDateTime(log.endTime, log.bakedOn)}
              onSave={save}
            />
          </>
        ) : (
          <>
            <Label>{formatDate(log.bakedOn)}</Label>
            <p className="mt-2 font-serif text-[28px] leading-tight">
              {log.title || "untitled"}
            </p>
            {(log.startTime || log.endTime) && (
              <Label className="mt-3">
                {[
                  formatSpan(log.startTime, log.endTime, log.bakedOn),
                  formatDuration(log.startTime, log.endTime, log.bakedOn),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Label>
            )}
          </>
        )}
      </div>

      {show(Boolean(log.recipeUrl.trim()) || log.recipeFiles.length > 0) && (
        <Section label="recipe">
          <RecipeSection
            logId={log.id}
            initialUrl={log.recipeUrl}
            initialFiles={log.recipeFiles}
            editable={editable}
            onSaveUrl={(recipeUrl) => save({ recipeUrl })}
          />
        </Section>
      )}

      {show(log.media.length > 0) && (
        <Section label="photos & videos">
          <MediaGallery
            logId={log.id}
            logDate={log.bakedOn}
            initialCover={log.coverMediaId}
            initial={log.media}
            editable={editable}
          />
        </Section>
      )}

      {show(hasIngredients) && (
        <Section label="ingredients">
          <LogIngredients
            logId={log.id}
            library={library}
            initial={log.ingredients}
            editable={editable}
          />
        </Section>
      )}

      {show(log.timeline.length > 0) && (
        <Section label="timeline">
          <Timeline
            logId={log.id}
            logDate={log.bakedOn}
            initial={log.timeline}
            editable={editable}
          />
        </Section>
      )}

      <TextSection
        label="process"
        initial={log.process}
        editable={editable}
        placeholder="method, temperatures, what you tried…"
        onSave={(process) => save({ process })}
      />
      <TextSection
        label="how it turned out"
        initial={log.notes}
        editable={editable}
        placeholder="texture, taste, what to change next time…"
        onSave={(notes) => save({ notes })}
      />

      {editable && (
        <div className="border-t border-black/10 pt-6">
          <ConfirmButton
            label="delete log"
            busyLabel="deleting…"
            note="It moves to recently deleted, where you can restore it for 30 days."
            onConfirm={() => deleteLog(log.id)}
          />
        </div>
      )}
    </article>
  );
}

function DateField({
  initial,
  onSave,
}: {
  initial: string;
  onSave: (value: string) => Promise<unknown>;
}) {
  const [value, setValue] = useState(initial);
  const { schedule, flush } = useAutosave(onSave, 0);
  return (
    <input
      type="date"
      value={value}
      required
      aria-label="Date"
      onChange={(e) => {
        if (!e.target.value) return;
        setValue(e.target.value);
        schedule(e.target.value);
      }}
      onBlur={flush}
      className="appearance-none bg-transparent font-mono text-base tracking-[0.04em] text-black/50 uppercase outline-none"
    />
  );
}

/**
 * Start and end of the bake (date and time; bakes can run over several
 * days), with the running length once both are set. Both are saved together
 * so an old time-only value is upgraded alongside the one being edited.
 */
function BakeTimes({
  start: initialStart,
  end: initialEnd,
  onSave,
}: {
  start: string;
  end: string;
  onSave: (patch: LogPatch) => Promise<unknown>;
}) {
  const [times, setTimes] = useState({ start: initialStart, end: initialEnd });
  const { schedule, flush } = useAutosave((next: typeof times) =>
    onSave({ startTime: next.start, endTime: next.end }),
  );
  const set = (change: Partial<typeof times>) => {
    const next = { ...times, ...change };
    setTimes(next);
    schedule(next);
  };
  const duration = formatDuration(times.start, times.end);
  return (
    <div className="mt-4 flex flex-col items-start gap-3">
      <DateTimeField
        label="start"
        value={times.start}
        onChange={(start) => set({ start })}
        onBlur={flush}
      />
      <DateTimeField
        label="end"
        value={times.end}
        onChange={(end) => set({ end })}
        onBlur={flush}
      />
      {duration && <Label className="text-black/70">took {duration}</Label>}
    </div>
  );
}

function DateTimeField({
  label,
  value,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <div className="flex items-baseline gap-2 border-b border-black/15 pb-1 focus-within:border-black">
      <Label className="w-10">{label}</Label>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-label={`${label} date and time`}
        className="w-[15.5rem] bg-transparent font-mono text-base outline-none [&::-webkit-calendar-picker-indicator]:opacity-30"
      />
      {!value && (
        <TextButton
          onClick={() => onChange(nowDateTime())}
          className="text-[10px]"
        >
          now
        </TextButton>
      )}
    </div>
  );
}
