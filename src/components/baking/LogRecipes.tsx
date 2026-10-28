"use client";

import { Plus, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { setRecipeSelected } from "@/app/baking/actions";
import type { Recipe } from "@/lib/baking/types";
import { track } from "./autosave";
import { RecipeBrowser } from "./RecipeBrowser";
import { RecipeRow } from "./RecipeList";
import { LineButton } from "./ui";

/** The recipes a log uses, picked from (or added to) the recipe library. */
export function LogRecipes({
  logId,
  library: initialLibrary,
  initial,
  editable,
}: {
  logId: string;
  library: Recipe[];
  initial: string[];
  editable: boolean;
}) {
  const [library, setLibrary] = useState(initialLibrary);
  const [selected, setSelected] = useState(initial);
  const [browsing, setBrowsing] = useState(false);
  const closeBrowser = useCallback(() => setBrowsing(false), []);

  const byId = useMemo(() => new Map(library.map((r) => [r.id, r])), [library]);
  const selectedIds = useMemo(() => new Set(selected), [selected]);
  const chosen = selected.flatMap((id) => byId.get(id) ?? []);

  async function setOn(id: string, on: boolean) {
    const before = selected;
    setSelected(on ? [...selected, id] : selected.filter((s) => s !== id));
    try {
      await track(setRecipeSelected(logId, id, on));
    } catch {
      setSelected(before);
    }
  }

  if (!editable) {
    if (chosen.length === 0) return null;
    return (
      <ul className="divide-y divide-black/10 border-y border-black/10">
        {chosen.map((recipe) => (
          <li key={recipe.id}>
            <RecipeRow recipe={recipe} href={`/baking/recipes/${recipe.id}`} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      {chosen.length > 0 && (
        <ul className="mb-4 divide-y divide-black/10 border-y border-black/10">
          {chosen.map((recipe) => (
            <li key={recipe.id} className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <RecipeRow
                  recipe={recipe}
                  href={`/baking/recipes/${recipe.id}`}
                />
              </div>
              <button
                type="button"
                aria-label={`Remove ${recipe.name || "recipe"}`}
                onClick={() => setOn(recipe.id, false)}
                className="-mr-1 shrink-0 p-1 text-black/30 hover:text-black"
              >
                <X size={15} strokeWidth={1.25} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <LineButton onClick={() => setBrowsing(true)}>
        <Plus size={14} strokeWidth={1.25} /> add recipes
      </LineButton>

      {browsing && (
        <RecipeBrowser
          library={library}
          selectedIds={selectedIds}
          onToggle={(id) => setOn(id, !selectedIds.has(id))}
          onCreated={async (recipe) => {
            setLibrary((list) =>
              [...list, recipe].sort((a, b) => a.name.localeCompare(b.name)),
            );
            await setOn(recipe.id, true);
          }}
          onClose={closeBrowser}
        />
      )}
    </div>
  );
}
