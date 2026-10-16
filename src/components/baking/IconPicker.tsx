"use client";

import { ClipboardPaste, ImagePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { openForCrop, type CropSource } from "@/lib/baking/image";
import { cn } from "@/lib/utils";
import { IconCropper } from "./IconCropper";
import { TextButton } from "./ui";

export type PickedIcon = { blob: Blob; url: string };

/**
 * Square image slot for an ingredient. Accepts a file, a drag-and-drop, ⌘V,
 * or the iPhone clipboard ("Copy Subject" on a photo, then "paste"), then
 * opens a square crop step before handing back the 720×720 icon.
 */
export function IconPicker({
  src,
  onIcon,
  className,
}: {
  src: string | null;
  onIcon: (icon: PickedIcon) => void;
  className?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cropping, setCropping] = useState<CropSource | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const onIconRef = useRef(onIcon);
  useEffect(() => {
    onIconRef.current = onIcon;
  });

  async function take(blob: Blob | null | undefined) {
    if (!blob) return;
    setError(null);
    setBusy(true);
    try {
      const source = await openForCrop(blob);
      setCropping((old) => {
        old?.release();
        return source;
      });
    } catch {
      setError("Couldn't read that image. Try a PNG.");
    } finally {
      setBusy(false);
    }
  }

  // Desktop: ⌘V an image anywhere on the page. Text pastes are left alone.
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const item = Array.from(event.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/"),
      );
      if (!item) return;
      event.preventDefault();
      take(item.getAsFile());
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

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          take(e.dataTransfer.files[0]);
        }}
        aria-label={src ? "Change image" : "Choose image"}
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
          source={cropping}
          onCancel={() => {
            cropping.release();
            setCropping(null);
          }}
          onDone={(icon) => {
            cropping.release();
            setCropping(null);
            onIcon({ blob: icon.blob, url: URL.createObjectURL(icon.blob) });
          }}
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
