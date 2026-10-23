"use client";

import { ArrowUpRight, FileText, X } from "lucide-react";
import { useRef, useState } from "react";
import { addRecipeFile, deleteRecipeFile } from "@/app/baking/actions";
import { displayUrl, safeHref, uid } from "@/lib/baking/format";
import { cn } from "@/lib/utils";
import type { RecipeFile } from "@/lib/baking/types";
import { track, useAutosave } from "./autosave";
import { AutosaveText, Label, TextButton } from "./ui";
import { contentTypeOf, uploadFile } from "./upload";

type Pending = { id: string; name: string; progress: number; error?: string };

/**
 * Where the recipe came from: an optional link, optional pasted recipe text,
 * and optional recipe photos or PDFs. Files are uploaded exactly as chosen (no resizing), so the full
 * page stays readable and can be opened from the log.
 */
export function RecipeSection({
  logId,
  initialUrl,
  initialFiles,
  initialText,
  editable,
  onSaveUrl,
  onSaveText,
}: {
  logId: string;
  initialUrl: string;
  initialFiles: RecipeFile[];
  initialText: string;
  editable: boolean;
  onSaveUrl: (url: string) => Promise<unknown>;
  onSaveText: (text: string) => Promise<unknown>;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [files, setFiles] = useState(initialFiles);
  const [pending, setPending] = useState<Pending[]>([]);
  const [confirming, setConfirming] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const { schedule, flush } = useAutosave(onSaveUrl);
  const href = safeHref(url);

  async function upload(file: File) {
    const temp: Pending = { id: uid(), name: file.name, progress: 0 };
    setPending((list) => [...list, temp]);
    const setOne = (change: Partial<Pending>) =>
      setPending((list) =>
        list.map((p) => (p.id === temp.id ? { ...p, ...change } : p)),
      );
    try {
      const key = await track(
        uploadFile(
          file,
          { purpose: "recipe", logId, filename: file.name },
          (progress) => setOne({ progress }),
        ),
      );
      const saved = await track(
        addRecipeFile(logId, {
          key,
          name: file.name,
          contentType: contentTypeOf(file, file.name),
          size: file.size,
        }),
      );
      setFiles((list) => [...list, saved]);
      setPending((list) => list.filter((p) => p.id !== temp.id));
    } catch (error) {
      setOne({
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  }

  async function remove(file: RecipeFile) {
    setConfirming(null);
    setFiles((list) => list.filter((f) => f.id !== file.id));
    try {
      await track(deleteRecipeFile(file.id));
    } catch {
      setFiles((list) => [...list, file]);
    }
  }

  return (
    <div className="space-y-4">
      {editable ? (
        <label className="flex items-baseline gap-2 border-b border-black/15 pb-1 focus-within:border-black">
          <Label>link</Label>
          <input
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              schedule(e.target.value);
            }}
            onBlur={flush}
            placeholder="paste the recipe's link"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/25"
          />
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open the recipe link"
              className="shrink-0 text-black/40 hover:text-black"
            >
              <ArrowUpRight size={15} strokeWidth={1.25} />
            </a>
          )}
        </label>
      ) : (
        href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-1 text-sm underline decoration-black/20 underline-offset-4 hover:decoration-black"
          >
            <span className="truncate">{displayUrl(href)}</span>
            <ArrowUpRight size={14} strokeWidth={1.25} className="shrink-0" />
          </a>
        )
      )}

      {editable ? (
        <AutosaveText
          initial={initialText}
          onSave={onSaveText}
          placeholder="paste the recipe"
          aria-label="Recipe"
          className="max-h-[50vh] min-h-[4.5rem] overflow-y-auto border border-black/15 p-3 text-[13px] focus:border-black"
        />
      ) : (
        initialText.trim() && <RecipeText text={initialText} />
      )}

      {(files.length > 0 || pending.length > 0) && (
        <ul className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
          {files.map((file) => (
            <li key={file.id} className="relative">
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                title={file.name}
                className="block aspect-square overflow-hidden border border-black/10 bg-black/[0.02]"
              >
                <RecipeThumb file={file} />
              </a>
              {editable && confirming !== file.id && (
                <button
                  type="button"
                  aria-label={`Delete ${file.name || "recipe file"}`}
                  onClick={() => setConfirming(file.id)}
                  className="absolute top-1 right-1 flex size-6 items-center justify-center border border-black/10 bg-white/90 text-black/60 backdrop-blur hover:text-black"
                >
                  <X size={12} strokeWidth={1.25} />
                </button>
              )}
              {confirming === file.id && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-white/90 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => remove(file)}
                    className="font-mono text-[10px] tracking-[0.1em] text-red-600 uppercase"
                  >
                    delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(null)}
                    className="font-mono text-[10px] tracking-[0.1em] text-black/55 uppercase"
                  >
                    cancel
                  </button>
                </div>
              )}
            </li>
          ))}
          {pending.map((p) => (
            <li
              key={p.id}
              className="flex aspect-square flex-col justify-end border border-black/10 p-1.5"
            >
              {p.error ? (
                <button
                  type="button"
                  onClick={() =>
                    setPending((list) => list.filter((x) => x.id !== p.id))
                  }
                  className="text-left text-[10px] leading-tight text-red-600"
                >
                  {p.error} · dismiss
                </button>
              ) : (
                <>
                  <p className="truncate text-[10px] text-black/50">{p.name}</p>
                  <div className="mt-1 h-px bg-black/15">
                    <div
                      className="h-px bg-black transition-[width]"
                      style={{ width: `${Math.round(p.progress * 100)}%` }}
                    />
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {editable && (
        <>
          <TextButton onClick={() => input.current?.click()}>
            + recipe photo or pdf
          </TextButton>
          <input
            ref={input}
            type="file"
            accept="image/*,application/pdf"
            multiple
            hidden
            onChange={(e) => {
              Array.from(e.target.files ?? []).forEach(upload);
              e.target.value = "";
            }}
          />
        </>
      )}
    </div>
  );
}

/** A photo thumbnail, or a file card for PDFs and images the browser can't show (e.g. HEIC in Chrome). */
function RecipeThumb({ file }: { file: RecipeFile }) {
  const [broken, setBroken] = useState(false);
  if (file.contentType.startsWith("image/") && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={file.url}
        alt={file.name}
        loading="lazy"
        onError={() => setBroken(true)}
        className="size-full object-cover"
      />
    );
  }
  return (
    <span className="flex size-full flex-col items-center justify-center gap-1 p-1.5 text-black/45">
      <FileText size={18} strokeWidth={1} />
      <span className="w-full truncate text-center text-[9px]">
        {file.name || "file"}
      </span>
    </span>
  );
}

/** Recipes longer than this many lines (or characters) start collapsed. */
const PREVIEW_LINES = 8;
const PREVIEW_CHARS = 500;

/** A pasted recipe, read-only: the first few lines, with "show full recipe". */
function RecipeText({ text }: { text: string }) {
  const trimmed = text.trim();
  const long =
    trimmed.split("\n").length > PREVIEW_LINES ||
    trimmed.length > PREVIEW_CHARS;
  const [open, setOpen] = useState(false);
  const collapsed = long && !open;
  return (
    <div className="border border-black/15 p-3">
      <p
        className={cn(
          "text-[13px] leading-relaxed whitespace-pre-wrap",
          collapsed && "line-clamp-8",
        )}
      >
        {trimmed}
      </p>
      {long && (
        <TextButton
          className="mt-2"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "show less ↑" : "show full recipe ↓"}
        </TextButton>
      )}
    </div>
  );
}
