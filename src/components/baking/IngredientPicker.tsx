"use client";

import { Check, ClipboardPaste, ImagePlus, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createIngredient,
  setIngredientAmount,
  setIngredientSelected,
} from "@/app/baking/actions";
import { toSquareIcon } from "@/lib/baking/image";
import type { Ingredient, LogIngredient } from "@/lib/baking/types";
import { cn } from "@/lib/utils";
import { track, useAutosave } from "./autosave";
import { LineButton, TextButton } from "./ui";
import { uploadFile } from "./upload";

export function IngredientIcon({
  ingredient,
  className,
  sizes = "96px",
}: {
  ingredient: Ingredient;
  className?: string;
  sizes?: string;
}) {
  return (
    <div className={cn("relative aspect-square bg-white", className)}>
      {ingredient.imageUrl ? (
        <Image
          src={ingredient.imageUrl}
          alt=""
          fill
          unoptimized
          sizes={sizes}
          className="object-contain"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center font-serif text-lg text-black/30">
          {ingredient.name.slice(0, 1)}
        </span>
      )}
    </div>
  );
}

export function IngredientPicker({
  logId,
  library: initialLibrary,
  initial,
  editable,
}: {
  logId: string;
  library: Ingredient[];
  initial: LogIngredient[];
  editable: boolean;
}) {
  const [library, setLibrary] = useState(initialLibrary);
  const [selected, setSelected] = useState(initial);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);

  const byId = useMemo(() => new Map(library.map((i) => [i.id, i])), [library]);
  const isSelected = (id: string) =>
    selected.some((s) => s.ingredientId === id);

  async function toggle(id: string) {
    const on = !isSelected(id);
    const before = selected;
    setSelected(
      on
        ? [...selected, { ingredientId: id, amount: "" }]
        : selected.filter((s) => s.ingredientId !== id),
    );
    try {
      await track(setIngredientSelected(logId, id, on));
    } catch {
      setSelected(before);
    }
  }

  const chosen = selected.flatMap((s) => {
    const ingredient = byId.get(s.ingredientId);
    return ingredient ? [{ ...s, ingredient }] : [];
  });

  if (!editable) {
    if (chosen.length === 0) return null;
    return (
      <ul className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-5">
        {chosen.map(({ ingredient, amount }) => (
          <li key={ingredient.id}>
            <IngredientIcon
              ingredient={ingredient}
              className="border border-black/10"
            />
            <p className="mt-2 text-sm leading-tight">{ingredient.name}</p>
            {amount && (
              <p className="mt-0.5 font-mono text-xs text-black/50">{amount}</p>
            )}
          </li>
        ))}
      </ul>
    );
  }

  const visible = query
    ? library.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()))
    : library;

  return (
    <div>
      {library.length > 12 && (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search ingredients"
          className="mb-4 w-full border-b border-black/15 bg-transparent pb-2 text-base outline-none placeholder:text-black/25 focus:border-black"
        />
      )}

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {visible.map((ingredient) => {
          const on = isSelected(ingredient.id);
          return (
            <button
              key={ingredient.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(ingredient.id)}
              className="group text-left"
            >
              <div
                className={cn(
                  "relative border transition-colors",
                  on
                    ? "border-black"
                    : "border-black/10 group-hover:border-black/40",
                )}
              >
                <IngredientIcon ingredient={ingredient} className="m-1.5" />
                {on && (
                  <span className="absolute top-1 right-1 flex size-4 items-center justify-center bg-black text-white">
                    <Check size={11} strokeWidth={2} />
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "mt-1.5 truncate text-[12px] leading-tight",
                  on ? "text-black" : "text-black/55",
                )}
              >
                {ingredient.name}
              </p>
            </button>
          );
        })}

        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-left"
          >
            <div className="flex aspect-square items-center justify-center border border-dashed border-black/25 text-black/40 transition-colors hover:border-black hover:text-black">
              <Plus size={20} strokeWidth={1} />
            </div>
            <p className="mt-1.5 text-[12px] leading-tight text-black/40">
              new
            </p>
          </button>
        )}
      </div>

      {adding && (
        <NewIngredient
          onCancel={() => setAdding(false)}
          onCreated={async (ingredient) => {
            setLibrary((list) =>
              [...list, ingredient].sort((a, b) =>
                a.name.localeCompare(b.name),
              ),
            );
            setAdding(false);
            setSelected((list) => [
              ...list,
              { ingredientId: ingredient.id, amount: "" },
            ]);
            await track(setIngredientSelected(logId, ingredient.id, true));
          }}
        />
      )}

      {chosen.length > 0 && (
        <ul className="mt-6 divide-y divide-black/10 border-y border-black/10">
          {chosen.map(({ ingredient, amount }) => (
            <AmountRow
              key={ingredient.id}
              logId={logId}
              ingredient={ingredient}
              initial={amount}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function AmountRow({
  logId,
  ingredient,
  initial,
}: {
  logId: string;
  ingredient: Ingredient;
  initial: string;
}) {
  const [amount, setAmount] = useState(initial);
  const { schedule, flush } = useAutosave((value: string) =>
    setIngredientAmount(logId, ingredient.id, value),
  );
  return (
    <li className="flex items-center gap-3 py-2">
      <IngredientIcon
        ingredient={ingredient}
        className="size-9 shrink-0"
        sizes="36px"
      />
      <span className="min-w-0 flex-1 truncate text-sm">{ingredient.name}</span>
      <input
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
          schedule(e.target.value);
        }}
        onBlur={flush}
        placeholder="amount"
        aria-label={`Amount of ${ingredient.name}`}
        className="w-28 bg-transparent text-right font-mono text-base outline-none placeholder:text-black/25"
      />
    </li>
  );
}

function NewIngredient({
  onCreated,
  onCancel,
}: {
  onCreated: (ingredient: Ingredient) => Promise<void>;
  onCancel: () => void;
}) {
  const [icon, setIcon] = useState<{ blob: Blob; url: string } | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function takeImage(blob: Blob | null | undefined) {
    if (!blob) return;
    setError(null);
    try {
      const prepared = await toSquareIcon(blob);
      setIcon((old) => {
        if (old) URL.revokeObjectURL(old.url);
        return { blob: prepared.blob, url: URL.createObjectURL(prepared.blob) };
      });
    } catch {
      setError("Couldn't read that image. Try a PNG.");
    }
  }

  // Desktop: ⌘V anywhere while this form is open.
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const item = Array.from(event.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/"),
      );
      if (item) {
        event.preventDefault();
        takeImage(item.getAsFile());
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  });

  // iPhone: "Copy Subject" on a photo, then tap paste.
  async function pasteFromClipboard() {
    try {
      for (const item of await navigator.clipboard.read()) {
        const type = item.types.find((t) => t.startsWith("image/"));
        if (type) return takeImage(await item.getType(type));
      }
      setError("No image on the clipboard.");
    } catch {
      setError("Clipboard access was blocked.");
    }
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const key = icon
        ? await track(uploadFile(icon.blob, { purpose: "ingredient" }))
        : null;
      const ingredient = await track(createIngredient(name, key));
      if (icon) URL.revokeObjectURL(icon.url);
      await onCreated(ingredient);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save");
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 border border-black/15 p-4">
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            takeImage(e.dataTransfer.files[0]);
          }}
          aria-label="Choose image"
          className={cn(
            "relative flex size-24 shrink-0 items-center justify-center text-black/35",
            icon
              ? "border border-black/10"
              : "border border-dashed border-black/25",
          )}
        >
          {icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={icon.url}
              alt=""
              className="size-full object-contain p-1"
            />
          ) : (
            <ImagePlus size={20} strokeWidth={1} />
          )}
        </button>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && name.trim() && save()}
            placeholder="ingredient name"
            enterKeyHint="done"
            className="w-full border-b border-black/15 bg-transparent pb-1.5 text-base outline-none placeholder:text-black/25 focus:border-black"
          />
          <TextButton onClick={pasteFromClipboard} className="self-start">
            <ClipboardPaste size={13} strokeWidth={1.25} /> paste image
          </TextButton>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-black/40">
        PNGs with no background work best. Transparent edges are trimmed so it
        sits centred in its square.
      </p>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <LineButton
          onClick={onCancel}
          className="border-black/15"
          disabled={busy}
        >
          cancel
        </LineButton>
        <LineButton onClick={save} disabled={busy || !name.trim()}>
          {busy ? "adding…" : "add"}
        </LineButton>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/webp,image/heic,image/heif,image/jpeg,image/*"
        hidden
        onChange={(e) => {
          takeImage(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
