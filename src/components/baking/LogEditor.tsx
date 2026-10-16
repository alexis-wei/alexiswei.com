"use client";

import { useState } from "react";
import { deleteLog, updateLog } from "@/app/baking/actions";
import { formatDate } from "@/lib/baking/format";
import type { BakingLog, Ingredient, LogPatch } from "@/lib/baking/types";
import { track, useAutosave, useUnsavedChangesWarning } from "./autosave";
import { BackLink } from "./BakingHeader";
import { LogIngredients } from "./LogIngredients";
import { MediaGallery } from "./MediaGallery";
import { Timeline } from "./Timeline";
import {
  AutosaveText,
  Label,
  SaveIndicator,
  Section,
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
  const [deleting, setDeleting] = useState(false);

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
            <div className="mt-4 flex gap-6">
              <RoomField
                label="room"
                initial={log.roomTemp}
                placeholder="22°C"
                onSave={(roomTemp) => save({ roomTemp })}
              />
              <RoomField
                label="humidity"
                initial={log.humidity}
                placeholder="45%"
                onSave={(humidity) => save({ humidity })}
              />
            </div>
          </>
        ) : (
          <>
            <Label>{formatDate(log.bakedOn)}</Label>
            <p className="mt-2 font-serif text-[28px] leading-tight">
              {log.title || "untitled"}
            </p>
            {(log.roomTemp || log.humidity) && (
              <Label className="mt-3">
                {[
                  log.roomTemp && `room ${log.roomTemp}`,
                  log.humidity && `humidity ${log.humidity}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Label>
            )}
          </>
        )}
      </div>

      {show(log.media.length > 0) && (
        <Section label="photos & videos">
          <MediaGallery
            logId={log.id}
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
            initial={log.timeline}
            editable={editable}
            onSave={(timeline) => save({ timeline })}
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
          <TextButton
            disabled={deleting}
            className="hover:text-red-600"
            onClick={async () => {
              if (!confirm("Delete this log and all of its photos and videos?"))
                return;
              setDeleting(true);
              await track(deleteLog(log.id)).catch(() => setDeleting(false));
            }}
          >
            {deleting ? "deleting…" : "delete log"}
          </TextButton>
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

/** Room conditions at the start of the bake; changes mid-bake go in the timeline. */
function RoomField({
  label,
  initial,
  placeholder,
  onSave,
}: {
  label: string;
  initial: string;
  placeholder: string;
  onSave: (value: string) => Promise<unknown>;
}) {
  const [value, setValue] = useState(initial);
  const { schedule, flush } = useAutosave(onSave);
  return (
    <label className="flex items-baseline gap-2 border-b border-black/15 pb-1 focus-within:border-black">
      <Label>{label}</Label>
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          schedule(e.target.value);
        }}
        onBlur={flush}
        placeholder={placeholder}
        className="w-16 bg-transparent font-mono text-base outline-none placeholder:text-black/25"
      />
    </label>
  );
}
