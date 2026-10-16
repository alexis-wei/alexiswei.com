"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { deleteLog, updateLog } from "@/app/baking/actions";
import { formatDate } from "@/lib/baking/format";
import type { BakingLog, Ingredient, LogPatch } from "@/lib/baking/types";
import { track, useAutosave, useUnsavedChangesWarning } from "./autosave";
import { IngredientPicker } from "./IngredientPicker";
import { MediaGallery } from "./MediaGallery";
import { Timeline } from "./Timeline";
import { AutosaveText, Label, SaveIndicator, Section, TextButton } from "./ui";

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
          <Link
            href="/baking"
            className="-ml-1 inline-flex items-center gap-1.5 p-1 text-sm text-black/60 hover:text-black"
          >
            <ArrowLeft size={16} strokeWidth={1.25} /> logs
          </Link>
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
          </>
        ) : (
          <>
            <Label>{formatDate(log.bakedOn)}</Label>
            <p className="mt-2 font-serif text-[28px] leading-tight">
              {log.title || "untitled"}
            </p>
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
          <IngredientPicker
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

function TextSection({
  label,
  initial,
  editable,
  placeholder,
  onSave,
}: {
  label: string;
  initial: string;
  editable: boolean;
  placeholder: string;
  onSave: (value: string) => Promise<unknown>;
}) {
  if (!editable && !initial.trim()) return null;
  return (
    <Section label={label}>
      {editable ? (
        <AutosaveText
          initial={initial}
          onSave={onSave}
          placeholder={placeholder}
          aria-label={label}
          className="min-h-[4.5rem]"
        />
      ) : (
        <p className="leading-relaxed whitespace-pre-wrap">{initial}</p>
      )}
    </Section>
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
