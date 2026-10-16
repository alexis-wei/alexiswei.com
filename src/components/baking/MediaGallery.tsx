"use client";

import { ChevronLeft, ChevronRight, Play, Plus, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { addMedia, deleteMedia } from "@/app/baking/actions";
import { uid } from "@/lib/baking/format";
import { preparePhoto } from "@/lib/baking/image";
import { compressVideo } from "@/lib/baking/video";
import type { Media } from "@/lib/baking/types";
import { track } from "./autosave";
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
  initial,
  editable,
}: {
  logId: string;
  initial: Media[];
  editable: boolean;
}) {
  const [items, setItems] = useState(initial);
  const [pending, setPending] = useState<Pending[]>([]);
  const [open, setOpen] = useState<number | null>(null);
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
    if (!confirm(`Delete this ${media.kind === "video" ? "video" : "photo"}?`))
      return;
    setItems((list) => list.filter((m) => m.id !== media.id));
    try {
      await track(deleteMedia(media.id));
    } catch {
      setItems((list) => [...list, media]);
    }
  }

  if (!editable && items.length === 0) return null;

  return (
    <div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {items.map((media, index) => (
          <div key={media.id} className="relative">
            <button
              type="button"
              onClick={() => setOpen(index)}
              aria-label={`Open ${media.kind} ${index + 1}`}
              className="relative block aspect-square w-full overflow-hidden bg-black/[0.03]"
            >
              <Thumb media={media} />
            </button>
            {editable && (
              <button
                type="button"
                aria-label="Delete"
                onClick={() => remove(media)}
                className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center border border-black/10 bg-white/90 text-black/60 backdrop-blur hover:text-black"
              >
                <X size={14} strokeWidth={1.25} />
              </button>
            )}
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
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

function Thumb({ media }: { media: Media }) {
  if (media.kind === "video") {
    return (
      <>
        {/* #t=0.1 makes iOS Safari paint the first frame as a poster. */}
        <video
          src={`${media.url}#t=0.1`}
          muted
          playsInline
          preload="metadata"
          className="size-full object-cover"
        />
        <span className="absolute bottom-2 left-2 flex size-7 items-center justify-center rounded-full bg-white/90">
          <Play size={12} strokeWidth={1.5} className="translate-x-px" />
        </span>
      </>
    );
  }
  return (
    <Image
      src={media.url}
      alt=""
      fill
      unoptimized
      sizes="(min-width: 640px) 220px, 50vw"
      className="object-cover"
    />
  );
}

function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: Media[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
}) {
  const media = items[index];
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
