"use client";

import { ChevronLeft, ChevronRight, Play, Plus, Star, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  addMedia,
  deleteMedia,
  setLogCover,
  updateMediaCaption,
} from "@/app/baking/actions";
import { takenAt } from "@/lib/baking/capture";
import { formatTakenAt, uid } from "@/lib/baking/format";
import { preparePhoto } from "@/lib/baking/image";
import { effectiveCover } from "@/lib/baking/order";
import { compressVideo } from "@/lib/baking/video";
import type { Media, TimelineStep } from "@/lib/baking/types";
import { track, useAutosave } from "./autosave";
import { stepLabel, useLogState } from "./LogState";
import { MediaThumb } from "./MediaThumb";
import { PhotoStepPicker } from "./StepPhotos";
import { AutoTextarea } from "./ui";
import { uploadFile } from "./upload";

type Pending = {
  id: string;
  kind: Media["kind"];
  previewUrl: string;
  stage: "waiting" | "compressing" | "uploading";
  progress: number;
  error?: string;
};

const isVideo = (file: File) =>
  file.type.startsWith("video/") || /\.(mov|mp4|webm|m4v)$/i.test(file.name);

export function MediaGallery({
  logId,
  logDate,
  initialCover,
  editable,
}: {
  logId: string;
  logDate: string;
  initialCover: string | null;
  editable: boolean;
}) {
  const { media: items, setMedia: setItems, steps, linkMedia } = useLogState();
  const [coverId, setCoverId] = useState(initialCover);
  const [pending, setPending] = useState<Pending[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [captioning, setCaptioning] = useState<string | null>(null);
  const [steppingFor, setSteppingFor] = useState<string | null>(null);
  const stepping = items.find((m) => m.id === steppingFor);
  const input = useRef<HTMLInputElement>(null);
  // Videos compress one at a time; encoding several at once would bog down a phone.
  const videoQueue = useRef<Promise<unknown>>(Promise.resolve());

  const setOne = (id: string, change: Partial<Pending>) =>
    setPending((list) =>
      list.map((p) => (p.id === id ? { ...p, ...change } : p)),
    );
  const dismiss = (p: Pending) => {
    URL.revokeObjectURL(p.previewUrl);
    setPending((list) => list.filter((x) => x.id !== p.id));
  };

  async function upload(file: File, previous: Promise<void>) {
    const kind = isVideo(file) ? "video" : "image";
    const temp: Pending = {
      id: uid(),
      kind,
      previewUrl: URL.createObjectURL(file),
      stage: kind === "video" ? "waiting" : "compressing",
      progress: 0,
    };
    setPending((list) => [...list, temp]);
    // Read the capture time from the untouched original, before resizing.
    const taken = takenAt(file, kind);
    try {
      let prepared;
      if (kind === "image") {
        prepared = await preparePhoto(file);
      } else {
        const compressed = videoQueue.current.then(() => {
          setOne(temp.id, { stage: "compressing" });
          return compressVideo(file, (progress) =>
            setOne(temp.id, { progress }),
          );
        });
        videoQueue.current = compressed.catch(() => {});
        prepared = await compressed;
      }
      setOne(temp.id, { stage: "uploading", progress: 0 });
      const key = await track(
        uploadFile(
          prepared.blob,
          { purpose: "media", logId, filename: file.name },
          (progress) => setOne(temp.id, { progress }),
        ),
      );
      // Uploads run in parallel, but register in the order they were picked.
      await previous.catch(() => {});
      const media = await track(
        addMedia(logId, {
          key,
          kind,
          width: prepared.width,
          height: prepared.height,
          takenAt: await taken,
        }),
      );
      setItems((list) => [...list, media]);
      dismiss(temp);
    } catch (error) {
      setOne(temp.id, {
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  }

  async function remove(media: Media) {
    setConfirming(null);
    setItems((list) => list.filter((m) => m.id !== media.id));
    try {
      await track(deleteMedia(media.id));
    } catch {
      setItems((list) => [...list, media]);
    }
  }

  // The chosen cover if it's still here; otherwise the first photo (or video),
  // matching what the logs list shows.
  const cover = effectiveCover(items, coverId);

  async function chooseCover(media: Media) {
    const previous = coverId;
    setCoverId(media.id);
    try {
      await track(setLogCover(logId, media.id));
    } catch {
      setCoverId(previous);
    }
  }

  const setCaption = (id: string, caption: string) =>
    setItems((list) => list.map((m) => (m.id === id ? { ...m, caption } : m)));

  if (!editable && items.length === 0) return null;

  return (
    <div>
      <div className="grid grid-cols-2 items-start gap-x-1.5 gap-y-4 sm:grid-cols-3">
        {items.map((media, index) => (
          <div key={media.id}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen(index)}
                aria-label={`Open ${media.kind} ${index + 1}`}
                className="relative block aspect-square w-full overflow-hidden bg-black/[0.03]"
              >
                <MediaThumb media={media} />
              </button>
              {editable &&
                confirming !== media.id &&
                (cover?.id === media.id ? (
                  <span className="pointer-events-none absolute top-1.5 left-1.5 flex h-7 items-center gap-1 bg-black px-2 font-mono text-[10px] tracking-[0.1em] text-white uppercase">
                    <Star size={11} strokeWidth={1.5} fill="currentColor" />
                    cover
                  </span>
                ) : (
                  <button
                    type="button"
                    aria-label="Use as cover"
                    title="Use as cover"
                    onClick={() => chooseCover(media)}
                    className="absolute top-1.5 left-1.5 flex size-7 items-center justify-center border border-black/10 bg-white/90 text-black/50 backdrop-blur hover:text-black"
                  >
                    <Star size={13} strokeWidth={1.25} />
                  </button>
                ))}
              {editable && confirming !== media.id && (
                <button
                  type="button"
                  onClick={() => setCaptioning(media.id)}
                  className="absolute right-1.5 bottom-1.5 flex h-6 items-center border border-black/10 bg-white/90 px-2 font-mono text-[9px] tracking-[0.1em] text-black/60 uppercase backdrop-blur hover:text-black"
                >
                  {media.caption ? "edit caption" : "caption"}
                </button>
              )}
              {editable && confirming !== media.id && (
                <button
                  type="button"
                  aria-label="Delete"
                  onClick={() => setConfirming(media.id)}
                  className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center border border-black/10 bg-white/90 text-black/60 backdrop-blur hover:text-black"
                >
                  <X size={14} strokeWidth={1.25} />
                </button>
              )}
              {confirming === media.id && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/90 backdrop-blur-sm">
                  <span className="font-mono text-[10px] tracking-[0.14em] text-black/60 uppercase">
                    delete {media.kind === "video" ? "video" : "photo"}?
                  </span>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => remove(media)}
                      className="font-mono text-[11px] tracking-[0.1em] text-red-600 uppercase"
                    >
                      yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(null)}
                      className="font-mono text-[11px] tracking-[0.1em] text-black/55 uppercase"
                    >
                      cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            <MediaCaption
              media={media}
              logDate={logDate}
              editing={captioning === media.id}
              editable={editable}
              step={stepLabel(steps, media.stepId)}
              onPickStep={() => setSteppingFor(media.id)}
              onDone={() => setCaptioning(null)}
              onCaption={(caption) => setCaption(media.id, caption)}
            />
          </div>
        ))}

        {pending.map((p) => (
          <div
            key={p.id}
            className="relative aspect-square overflow-hidden bg-black/[0.03]"
          >
            {p.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.previewUrl}
                alt=""
                className="size-full object-cover opacity-50"
              />
            ) : (
              <video
                src={p.previewUrl}
                muted
                playsInline
                className="size-full object-cover opacity-50"
              />
            )}
            {p.error ? (
              <button
                type="button"
                onClick={() => dismiss(p)}
                className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/80 p-3 text-center text-xs text-red-600"
              >
                {p.error}
                <span className="font-mono text-[10px] text-black/50 uppercase">
                  tap to dismiss
                </span>
              </button>
            ) : (
              <div className="absolute inset-x-3 bottom-3">
                <p className="mb-1.5 font-mono text-[10px] tracking-[0.1em] text-black/60 uppercase">
                  {p.stage}
                  {p.stage !== "waiting" && ` ${Math.round(p.progress * 100)}%`}
                </p>
                <div className="h-px bg-black/15">
                  <div
                    className="h-px bg-black transition-[width]"
                    style={{ width: `${Math.round(p.progress * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        {editable && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-2 border border-dashed border-black/25 text-black/45 transition-colors hover:border-black hover:text-black"
          >
            <Plus size={20} strokeWidth={1} />
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase">
              photo / video
            </span>
          </button>
        )}
      </div>

      {editable && (
        <input
          ref={input}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(e) => {
            let previous = Promise.resolve();
            for (const file of Array.from(e.target.files ?? [])) {
              previous = upload(file, previous);
            }
            e.target.value = "";
          }}
        />
      )}

      {open !== null && items[open] && (
        <Lightbox
          items={items}
          steps={steps}
          logDate={logDate}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}

      {stepping && (
        <PhotoStepPicker
          photo={stepping}
          steps={steps}
          logDate={logDate}
          onPick={(stepId) => {
            linkMedia(stepping.id, stepId);
            setSteppingFor(null);
          }}
          onClose={() => setSteppingFor(null)}
        />
      )}
    </div>
  );
}

/** Capture time and caption under a tile; the caption autosaves. */
/**
 * Capture time and caption under a tile. Editing opens from the tile's
 * "caption" button and closes when the field loses focus; it autosaves.
 */
function MediaCaption({
  media,
  logDate,
  editing,
  editable,
  step,
  onPickStep,
  onDone,
  onCaption,
}: {
  media: Media;
  logDate: string;
  editing: boolean;
  editable: boolean;
  step: string | null; // label of the step it belongs to
  onPickStep: () => void;
  onDone: () => void;
  onCaption: (caption: string) => void;
}) {
  const { schedule, flush } = useAutosave((caption: string) =>
    updateMediaCaption(media.id, caption),
  );
  const time = media.takenAt ? formatTakenAt(media.takenAt, logDate) : null;
  if (!editing && !editable && !time && !media.caption && !step) return null;
  return (
    <div className="mt-1.5">
      {editable ? (
        <button
          type="button"
          onClick={onPickStep}
          aria-label={
            step ? `Change step (${step})` : `Link this ${media.kind} to a step`
          }
          className="mb-0.5 flex max-w-full items-center gap-1 font-mono text-[10px] tracking-[0.06em] text-black/45 hover:text-black"
        >
          <span className="truncate">{step ? `↳ ${step}` : "+ step"}</span>
        </button>
      ) : (
        step && (
          <p className="mb-0.5 truncate font-mono text-[10px] tracking-[0.06em] text-black/45">
            ↳ {step}
          </p>
        )
      )}
      {time && (
        <p className="font-mono text-[10px] tracking-[0.1em] text-black/45 uppercase">
          {time}
        </p>
      )}
      {editing ? (
        <AutoTextarea
          autoFocus
          value={media.caption}
          onChange={(e) => {
            onCaption(e.target.value);
            schedule(e.target.value);
          }}
          onBlur={() => {
            flush();
            onDone();
          }}
          placeholder="caption"
          aria-label={`Caption for ${media.kind}`}
          className="border-b border-black/20 text-[13px] leading-snug focus:border-black"
        />
      ) : (
        media.caption && (
          <p className="text-[13px] leading-snug whitespace-pre-wrap">
            {media.caption}
          </p>
        )
      )}
    </div>
  );
}

function Lightbox({
  items,
  steps,
  logDate,
  index,
  onIndex,
  onClose,
}: {
  items: Media[];
  steps: TimelineStep[];
  logDate: string;
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
}) {
  const media = items[index];
  const time = media.takenAt ? formatTakenAt(media.takenAt, logDate) : null;
  const step = stepLabel(steps, media.stepId);
  const touchX = useRef<number | null>(null);
  const go = (delta: number) =>
    onIndex((index + delta + items.length) % items.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % items.length);
      if (e.key === "ArrowLeft")
        onIndex((index - 1 + items.length) % items.length);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, items.length, onClose, onIndex]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col bg-white"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-black/10 px-4 pt-[env(safe-area-inset-top)]">
        <span className="font-mono text-[11px] text-black/50">
          {index + 1} / {items.length}
        </span>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="-mr-2 p-2"
        >
          <X size={20} strokeWidth={1.25} />
        </button>
      </div>
      <div className="relative min-h-0 flex-1">
        {media.kind === "video" ? (
          <video
            key={media.id}
            src={media.url}
            controls
            autoPlay
            playsInline
            className="absolute inset-0 size-full object-contain"
          />
        ) : (
          <Image
            key={media.id}
            src={media.url}
            alt=""
            fill
            unoptimized
            sizes="100vw"
            className="object-contain"
          />
        )}
      </div>
      {(time || media.caption || step) && (
        <div className="shrink-0 border-t border-black/10 px-4 py-3">
          {step && (
            <p className="truncate font-mono text-[10px] tracking-[0.06em] text-black/45">
              ↳ {step}
            </p>
          )}
          {time && (
            <p className="font-mono text-[10px] tracking-[0.1em] text-black/45 uppercase">
              {time}
            </p>
          )}
          {media.caption && (
            <p className="mt-0.5 text-sm leading-snug whitespace-pre-wrap">
              {media.caption}
            </p>
          )}
        </div>
      )}
      {items.length > 1 && (
        <div className="flex h-14 shrink-0 items-center justify-between border-t border-black/10 px-2 pb-[env(safe-area-inset-bottom)]">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => go(-1)}
            className="p-3"
          >
            <ChevronLeft size={20} strokeWidth={1.25} />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => go(1)}
            className="p-3"
          >
            <ChevronRight size={20} strokeWidth={1.25} />
          </button>
        </div>
      )}
    </div>
  );
}
