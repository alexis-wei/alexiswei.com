"use client";

import { MoreVertical } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type MenuItem = { label: string; ariaLabel?: string } & (
  | { href: string }
  | { onSelect: () => void; disabled?: boolean }
);

/** Three-dot button with a small dropdown of links and actions. */
export function MoreMenu({
  items,
  label = "More",
  align = "left",
}: {
  items: MenuItem[];
  label?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (
        e instanceof KeyboardEvent
          ? e.key === "Escape"
          : !root.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="-m-1.5 flex p-1.5 text-black/40 transition-colors hover:text-black"
      >
        <MoreVertical size={14} strokeWidth={1.25} />
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute top-full ${align === "right" ? "right-0" : "left-0"} z-30 mt-2 min-w-40 border border-black/15 bg-white py-1`}
        >
          {items.map((item) =>
            "href" in item ? (
              <Link
                key={item.label}
                href={item.href}
                role="menuitem"
                aria-label={item.ariaLabel}
                onClick={() => setOpen(false)}
                className={itemClass}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                aria-label={item.ariaLabel}
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className={itemClass}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

const itemClass =
  "block w-full px-3 py-2 text-left font-mono text-[11px] tracking-[0.1em] whitespace-nowrap text-black/70 uppercase hover:bg-black/[0.03] hover:text-black disabled:opacity-40";
