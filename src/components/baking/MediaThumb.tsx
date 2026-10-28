import { Play } from "lucide-react";
import Image from "next/image";
import type { Media } from "@/lib/baking/types";
import { cn } from "@/lib/utils";

/**
 * A square-cropped photo or video still, filling its (relatively positioned)
 * parent. `small` shrinks the play badge for tiny thumbnails.
 */
export function MediaThumb({
  media,
  sizes = "(min-width: 640px) 220px, 50vw",
  small,
}: {
  media: Media;
  sizes?: string;
  small?: boolean;
}) {
  if (media.kind === "video") {
    return (
      <>
        {/* #t=0.1 makes iOS Safari paint the first frame as a poster. */}
        <video
          src={`${media.url}#t=0.1`}
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 size-full object-cover"
        />
        <span
          className={cn(
            "absolute flex items-center justify-center rounded-full bg-white/90",
            small ? "bottom-1 left-1 size-4" : "bottom-2 left-2 size-7",
          )}
        >
          <Play
            size={small ? 8 : 12}
            strokeWidth={1.5}
            className="translate-x-px"
          />
        </span>
      </>
    );
  }
  return (
    <Image
      src={media.url}
      alt={media.caption}
      fill
      unoptimized
      sizes={sizes}
      className="object-cover"
    />
  );
}
