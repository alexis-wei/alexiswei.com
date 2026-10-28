"use client";

import { ArrowLeft, FileText, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { addRecipeFile, createRecipe } from "@/app/baking/actions";
import type { Recipe } from "@/lib/baking/types";
import { track } from "./autosave";
import { matchesRecipe, RecipeRow, RecipeSearch } from "./RecipeList";
import { AutoTextarea, Label, LineButton, TextButton } from "./ui";
import { contentTypeOf, uploadFile } from "./upload";

/**
 * Popup for picking a log's recipes from the library, or adding a new one
 * (from a link, pasted text, and/or photos and PDFs). Works like the
 * ingredient popup: the add form saves itself however it's left (back,
 * done, tapping outside, Escape), as long as it has something in it.
 */
export function RecipeBrowser({
  library,
  selectedIds,
  onToggle,
  onCreated,
  onClose,
}: {
  library: Recipe[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onCreated: (recipe: Recipe) => Promise<void>;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState<string | null>(null);
  // Set by the add form while it's open: saves it, resolving false on failure.
  const saveDraft = useRef<(() => Promise<boolean>) | null>(null);

  /** Leaves the add form (saving it first), then does `next`. */
  async function leave(next: () => void) {
    if (saveDraft.current && !(await saveDraft.current())) return;
    next();
  }
  const leaveRef = useRef(leave);
  useEffect(() => {
    leaveRef.current = leave;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && leaveRef.current(onClose);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const q = query.trim();
  const matches = library.filter((r) => matchesRecipe(r, q));
  const exact = library.some((r) => r.name.toLowerCase() === q.toLowerCase());
  const count = selectedIds.size;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 sm:items-center sm:p-6"
      onClick={() => leave(onClose)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose recipes"
        onClick={(e) => e.stopPropagation()}
        className="flex h-[90dvh] w-full flex-col border-t border-black/10 bg-white sm:h-[min(80dvh,720px)] sm:max-w-lg sm:border"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-black/10 px-4">
          {adding !== null ? (
            <button
              type="button"
              onClick={() => leave(() => setAdding(null))}
              className="-ml-1 inline-flex items-center gap-1.5 p-1 text-sm text-black/60 hover:text-black"
            >
              <ArrowLeft size={16} strokeWidth={1.25} /> browse
            </button>
          ) : (
            <Label>{count > 0 ? `${count} selected` : "choose recipes"}</Label>
          )}
          <button
            type="button"
            onClick={() => leave(onClose)}
            className="-mr-1 p-1 text-sm"
          >
            done
          </button>
        </div>

        {adding !== null ? (
          <NewRecipeForm
            initialName={adding}
            register={(save) => (saveDraft.current = save)}
            onCreated={async (recipe) => {
              await onCreated(recipe);
              setAdding(null);
              setQuery("");
            }}
          />
        ) : (
          <>
            <div className="shrink-0 px-4 pt-4">
              <RecipeSearch value={query} onChange={setQuery} />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
              {q && !exact && (
                <button
                  type="button"
                  onClick={() => setAdding(q)}
                  className="mb-4 flex w-full items-center gap-3 border border-dashed border-black/25 p-3 text-left transition-colors hover:border-black"
                >
                  <Plus
                    size={18}
                    strokeWidth={1}
                    className="shrink-0 text-black/50"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    add “{q}”
                  </span>
                  <Label className="shrink-0">new recipe</Label>
                </button>
              )}

              {library.length === 0 && !q ? (
                <p className="py-6 text-center text-sm text-black/40">
                  your recipe library is empty
                </p>
              ) : matches.length === 0 ? (
                <p className="py-6 text-center text-sm text-black/40">
                  nothing called “{q}” yet
                </p>
              ) : (
                <ul className="divide-y divide-black/10 border-y border-black/10">
                  {matches.map((recipe) => (
                    <li key={recipe.id}>
                      <RecipeRow
                        recipe={recipe}
                        selected={selectedIds.has(recipe.id)}
                        onClick={() => onToggle(recipe.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
              {/* Always available, so adding never depends on searching first. */}
              <LineButton
                className="mt-4"
                onClick={() => setAdding(exact ? "" : q)}
              >
                <Plus size={14} strokeWidth={1.25} /> new recipe
              </LineButton>
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

function NewRecipeForm({
  initialName,
  register,
  onCreated,
}: {
  initialName: string;
  register: (save: (() => Promise<boolean>) | null) => void;
  onCreated: (recipe: Recipe) => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const saving = useRef<Promise<boolean> | null>(null);

  /**
   * Creates the recipe, then uploads its files. Resolves true when it's safe
   * to leave the form: saved, or nothing was entered. A second call while
   * saving waits for the first rather than creating a duplicate.
   */
  function save(): Promise<boolean> {
    if (saving.current) return saving.current;
    const blank = !name.trim() && !url.trim() && !text.trim() && !files.length;
    if (blank) return Promise.resolve(true);
    if (!name.trim()) {
      setError("Add a name to save this recipe.");
      return Promise.resolve(false);
    }
    setBusy(true);
    setError(null);
    saving.current = (async () => {
      try {
        const recipe = await track(createRecipe({ name, url, text }));
        for (const file of files) {
          const key = await track(
            uploadFile(file, {
              purpose: "recipe",
              recipeId: recipe.id,
              filename: file.name,
            }),
          );
          recipe.files.push(
            await track(
              addRecipeFile(recipe.id, {
                key,
                name: file.name,
                contentType: contentTypeOf(file, file.name),
                size: file.size,
              }),
            ),
          );
        }
        await onCreated(recipe);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't save");
        setBusy(false);
        saving.current = null;
        return false;
      }
    })();
    return saving.current;
  }

  // Let the popup save this form when it's left by any route.
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  useEffect(() => {
    register(() => saveRef.current());
    return () => register(null);
  }, [register]);

  return (
    <>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5">
        <Field label="name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus={!initialName}
            placeholder="e.g. brown butter miso cookies"
            className="w-full bg-transparent text-base outline-none placeholder:text-black/25"
          />
        </Field>
        <Field label="link">
          <input
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="paste the recipe's link"
            className="w-full bg-transparent text-base outline-none placeholder:text-black/25"
          />
        </Field>
        <Field label="recipe">
          <AutoTextarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="paste the recipe"
            aria-label="Recipe text"
            className="max-h-[40dvh] min-h-[4.5rem] overflow-y-auto text-[13px]"
          />
        </Field>
        <div>
          {files.length > 0 && (
            <ul className="mb-3 space-y-1.5">
              {files.map((file, i) => (
                <li
                  key={`${file.name}-${i}`}
                  className="flex items-center gap-2 text-sm"
                >
                  <FileText
                    size={14}
                    strokeWidth={1}
                    className="shrink-0 text-black/40"
                  />
                  <span className="min-w-0 flex-1 truncate">{file.name}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    onClick={() =>
                      setFiles((list) => list.filter((_, j) => j !== i))
                    }
                    className="shrink-0 p-1 text-black/30 hover:text-black"
                  >
                    <X size={13} strokeWidth={1.25} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <TextButton onClick={() => input.current?.click()}>
            + recipe photo or pdf
          </TextButton>
          <input
            ref={input}
            type="file"
            accept="image/*,application/pdf"
            multiple
            hidden
            data-testid="recipe-files"
            onChange={(e) => {
              const chosen = Array.from(e.target.files ?? []);
              setFiles((list) => [...list, ...chosen]);
              e.target.value = "";
            }}
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
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
