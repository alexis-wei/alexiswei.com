"use client";

import { ClipboardPaste, ImagePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  openForCrop,
  openStoredForCrop,
  shrinkOriginal,
  toSavedCrop,
  type Crop,
  type CropSource,
  type PreparedImage,
} from "@/lib/baking/image";
import type { IngredientImage, SavedCrop } from "@/lib/baking/types";
import { cn } from "@/lib/utils";
import { track } from "./autosave";
import { IconCropper } from "./IconCropper";
import { TextButton } from "./ui";
import { uploadFile } from "./upload";

export type PickedIcon = {
  blob: Blob; // the 720×720 icon
  url: string; // object URL of the icon, for previewing before it's uploaded
  crop: SavedCrop;
  source?: Blob; // the ≤720px original; absent when re-cropping the same one
};

/** Uploads a picked icon (and its original, if new) for saving. */
export async function uploadIcon(icon: PickedIcon): Promise<IngredientImage> {
  const [imageKey, sourceKey] = await Promise.all([
    track(uploadFile(icon.blob, { purpose: "ingredient" })),
    icon.source
      ? track(uploadFile(icon.source, { purpose: "ingredient" }))
      : undefined,
  ]);
  return { imageKey, sourceKey, crop: icon.crop };
}

/**
 * Square image slot for an ingredient. Accepts a file, a drag-and-drop, ⌘V,
 * or the iPhone clipboard ("Copy Subject" on a photo, then "paste"), then
 * opens a square crop step before handing back the 720×720 icon. When the
 * original is stored, "adjust" re-opens the crop step on it.
 */
export function IconPicker({
  src,
  sourceUrl,
  crop,
  onIcon,
  className,
}: {
  src: string | null;
  sourceUrl?: string | null;
  crop?: SavedCrop | null;
  onIcon: (icon: PickedIcon) => void;
  className?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cropping, setCropping] = useState<{
    source: CropSource;
    isNew: boolean;
  } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function open(load: () => Promise<CropSource>, isNew: boolean) {
    setError(null);
    setBusy(true);
    try {
      const source = await load();
      setCropping((old) => {
        old?.source.release();
        return { source, isNew };
      });
    } catch {
      setError(
        isNew
          ? "Couldn't read that image. Try a PNG."
          : "Couldn't load the original image.",
      );
    } finally {
      setBusy(false);
    }
  }

  const take = (blob: Blob | null | undefined) => {
    if (blob) open(() => openForCrop(blob), true);
  };
  const adjust = () => {
    if (sourceUrl)
      open(() => openStoredForCrop(sourceUrl, crop ?? null), false);
  };

  // Desktop: ⌘V an image anywhere on the page. Text pastes are left alone.
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const item = Array.from(event.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/"),
      );
      if (!item) return;
      event.preventDefault();
      const blob = item.getAsFile();
      if (blob) open(() => openForCrop(blob), true);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  async function pasteFromClipboard() {
    try {
      for (const item of await navigator.clipboard.read()) {
        const type = item.types.find((t) => t.startsWith("image/"));
        if (type) return take(await item.getType(type));
      }
      setError("No image on the clipboard.");
    } catch {
      setError("Clipboard access was blocked.");
    }
  }

  async function finish(icon: PreparedImage, cropped: Crop) {
    if (!cropping) return;
    const { source, isNew } = cropping;
    const picked: PickedIcon = {
      blob: icon.blob,
      url: URL.createObjectURL(icon.blob),
      crop: toSavedCrop(cropped, source.img),
      source: isNew ? await shrinkOriginal(source.img) : undefined,
    };
    source.release();
    setCropping(null);
    onIcon(picked);
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => (sourceUrl ? adjust() : fileInput.current?.click())}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          take(e.dataTransfer.files[0]);
        }}
        aria-label={
          sourceUrl ? "Adjust image" : src ? "Replace image" : "Choose image"
        }
        className={cn(
          "relative flex aspect-square w-full items-center justify-center text-black/35 transition-colors hover:text-black",
          src
            ? "border border-black/10"
            : "border border-dashed border-black/25 hover:border-black",
          busy && "opacity-50",
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="size-full object-contain" />
        ) : (
          <ImagePlus size={22} strokeWidth={1} />
        )}
      </button>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
        {sourceUrl && <TextButton onClick={adjust}>adjust</TextButton>}
        <TextButton onClick={() => fileInput.current?.click()}>
          {src ? "replace" : "choose"}
        </TextButton>
        <TextButton onClick={pasteFromClipboard}>
          <ClipboardPaste size={12} strokeWidth={1.25} /> paste
        </TextButton>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {cropping && (
        <IconCropper
          source={cropping.source}
          onCancel={() => {
            cropping.source.release();
            setCropping(null);
          }}
          onDone={finish}
        />
      )}
      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/webp,image/heic,image/heif,image/jpeg,image/*"
        hidden
        onChange={(e) => {
          take(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
