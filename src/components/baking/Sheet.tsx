"use client";

import { useEffect } from "react";
import { Label } from "./ui";

/**
 * A bottom sheet on phones (a centred panel on wider screens) for quick
 * pickers. Closes with "done", Escape, or a tap outside.
 */
export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[80dvh] w-full flex-col border-t border-black/10 bg-white sm:max-w-lg sm:border"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-black/10 px-4">
          <Label>{title}</Label>
          <button type="button" onClick={onClose} className="-mr-1 p-1 text-sm">
            done
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
          {children}
        </div>
      </div>
    </div>
  );
}
