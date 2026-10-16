"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { createIngredient } from "@/app/baking/actions";
import type { Ingredient } from "@/lib/baking/types";
import { track } from "./autosave";
import { IconPicker, uploadIcon, type PickedIcon } from "./IconPicker";
import { IngredientTile, matchesQuery, SearchInput } from "./IngredientGrid";
import { AutoTextarea, Label, LineButton } from "./ui";

/**
 * Popup for picking a log's ingredients from the library. Browsing comes
 * first; adding a new ingredient is offered only when a search finds no
 * exact match (or the library is empty).
 */
export function IngredientBrowser({
  library,
  selectedIds,
  onToggle,
  onCreated,
  onClose,
}: {
  library: Ingredient[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onCreated: (ingredient: Ingredient) => Promise<void>;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState<string | null>(null);

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

  const q = query.trim();
  const matches = library.filter((i) => matchesQuery(i, q));
  const exact = library.some((i) => i.name.toLowerCase() === q.toLowerCase());
  const count = selectedIds.size;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose ingredients"
        onClick={(e) => e.stopPropagation()}
        className="flex h-[90dvh] w-full flex-col border-t border-black/10 bg-white sm:h-[min(80dvh,720px)] sm:max-w-lg sm:border"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-black/10 px-4">
          {adding !== null ? (
            <button
              type="button"
              onClick={() => setAdding(null)}
              className="-ml-1 inline-flex items-center gap-1.5 p-1 text-sm text-black/60 hover:text-black"
            >
              <ArrowLeft size={16} strokeWidth={1.25} /> browse
            </button>
          ) : (
            <Label>
              {count > 0 ? `${count} selected` : "choose ingredients"}
            </Label>
          )}
          <button type="button" onClick={onClose} className="-mr-1 p-1 text-sm">
            done
          </button>
        </div>

        {adding !== null ? (
          <NewIngredientForm
            initialName={adding}
            onCreated={async (ingredient) => {
              await onCreated(ingredient);
              setAdding(null);
              setQuery("");
            }}
          />
        ) : (
          <>
            <div className="shrink-0 px-4 pt-4">
              <SearchInput value={query} onChange={setQuery} />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
              {q && !exact && (
                <button
                  type="button"
                  onClick={() => setAdding(q)}
                  className="mb-5 flex w-full items-center gap-3 border border-dashed border-black/25 p-3 text-left transition-colors hover:border-black"
                >
                  <Plus
                    size={18}
                    strokeWidth={1}
                    className="shrink-0 text-black/50"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    add “{q}”
                  </span>
                  <Label className="shrink-0">new ingredient</Label>
                </button>
              )}

              {library.length === 0 && !q ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-black/40">
                    your ingredient library is empty
                  </p>
                  <LineButton className="mt-4" onClick={() => setAdding("")}>
                    <Plus size={14} strokeWidth={1.25} /> new ingredient
                  </LineButton>
                </div>
              ) : matches.length === 0 ? (
                <p className="py-6 text-center text-sm text-black/40">
                  nothing called “{q}” yet
                </p>
              ) : (
                <ul className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4">
                  {matches.map((ingredient) => (
                    <li key={ingredient.id}>
                      <IngredientTile
                        ingredient={ingredient}
                        selected={selectedIds.has(ingredient.id)}
                        onClick={() => onToggle(ingredient.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block border-b border-black/15 pb-2 focus-within:border-black">
      <Label>{label}</Label>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function NewIngredientForm({
  initialName,
  onCreated,
}: {
  initialName: string;
  onCreated: (ingredient: Ingredient) => Promise<void>;
}) {
  const [icon, setIcon] = useState<PickedIcon | null>(null);
  // Local URL of the not-yet-uploaded original, so "adjust" works before saving.
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [name, setName] = useState(initialName);
  const [origin, setOrigin] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const image = icon ? await uploadIcon(icon) : null;
      const ingredient = await track(
        createIngredient({ name, origin, details, image }),
      );
      await onCreated(ingredient);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save");
      setBusy(false);
    }
  }

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <div className="flex gap-4">
          <IconPicker
            src={icon?.url ?? null}
            sourceUrl={sourceUrl}
            crop={icon?.crop}
            onIcon={(next) => {
              if (icon) URL.revokeObjectURL(icon.url);
              if (next.source) {
                if (sourceUrl) URL.revokeObjectURL(sourceUrl);
                setSourceUrl(URL.createObjectURL(next.source));
              }
              // A re-crop keeps the original from the first pick.
              setIcon({ ...next, source: next.source ?? icon?.source });
            }}
            className="w-28 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <Field label="name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus={!initialName}
                placeholder="e.g. cultured butter"
                className="w-full bg-transparent text-base outline-none placeholder:text-black/25"
              />
            </Field>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-black/40">
          PNGs with no background work best. Transparent edges are trimmed so it
          sits centred in its square.
        </p>
        <div className="mt-6 space-y-5">
          <Field label="where it's from">
            <input
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="brand, shop, farm, country…"
              className="w-full bg-transparent text-base outline-none placeholder:text-black/25"
            />
          </Field>
          <Field label="how it's made">
            <AutoTextarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="milling, culturing, fat %, process notes…"
              className="min-h-[4.5rem]"
            />
          </Field>
        </div>
        {error && <p className="mt-4 text-xs text-red-600">{error}</p>}
      </div>
      <div className="shrink-0 border-t border-black/10 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <LineButton
          onClick={save}
          disabled={busy || !name.trim()}
          className="w-full justify-center"
        >
          {busy ? "adding…" : "add to log"}
        </LineButton>
      </div>
    </>
  );
}
