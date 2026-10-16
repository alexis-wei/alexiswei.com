"use client";

import { Plus, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  setIngredientAmount,
  setIngredientSelected,
} from "@/app/baking/actions";
import type { Ingredient, LogIngredient } from "@/lib/baking/types";
import { track, useAutosave } from "./autosave";
import { IngredientBrowser } from "./IngredientBrowser";
import { IngredientIcon } from "./IngredientIcon";
import { LineButton } from "./ui";

export function LogIngredients({
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
  const [browsing, setBrowsing] = useState(false);
  const closeBrowser = useCallback(() => setBrowsing(false), []);

  const byId = useMemo(() => new Map(library.map((i) => [i.id, i])), [library]);
  const selectedIds = useMemo(
    () => new Set(selected.map((s) => s.ingredientId)),
    [selected],
  );
  const chosen = selected.flatMap((s) => {
    const ingredient = byId.get(s.ingredientId);
    return ingredient ? [{ ...s, ingredient }] : [];
  });

  async function setOn(id: string, on: boolean) {
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

  if (!editable) {
    if (chosen.length === 0) return null;
    return (
      <ul className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-5">
        {chosen.map(({ ingredient, amount }) => (
          <li key={ingredient.id}>
            <Link
              href={`/baking/ingredients/${ingredient.id}`}
              className="group block"
            >
              <IngredientIcon
                ingredient={ingredient}
                className="border border-black/10 transition-colors group-hover:border-black/40"
              />
              <p className="mt-2 text-sm leading-tight">{ingredient.name}</p>
              {amount && (
                <p className="mt-0.5 font-mono text-xs text-black/50">
                  {amount}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      {chosen.length > 0 && (
        <ul className="mb-4 divide-y divide-black/10 border-y border-black/10">
          {chosen.map(({ ingredient, amount }) => (
            <AmountRow
              key={ingredient.id}
              logId={logId}
              ingredient={ingredient}
              initial={amount}
              onRemove={() => setOn(ingredient.id, false)}
            />
          ))}
        </ul>
      )}
      <LineButton onClick={() => setBrowsing(true)}>
        <Plus size={14} strokeWidth={1.25} /> add ingredients
      </LineButton>

      {browsing && (
        <IngredientBrowser
          library={library}
          selectedIds={selectedIds}
          onToggle={(id) => setOn(id, !selectedIds.has(id))}
          onCreated={async (ingredient) => {
            setLibrary((list) =>
              [...list, ingredient].sort((a, b) =>
                a.name.localeCompare(b.name),
              ),
            );
            await setOn(ingredient.id, true);
          }}
          onClose={closeBrowser}
        />
      )}
    </div>
  );
}

function AmountRow({
  logId,
  ingredient,
  initial,
  onRemove,
}: {
  logId: string;
  ingredient: Ingredient;
  initial: string;
  onRemove: () => void;
}) {
  const [amount, setAmount] = useState(initial);
  const { schedule, flush } = useAutosave((value: string) =>
    setIngredientAmount(logId, ingredient.id, value),
  );
  return (
    <li className="flex items-center gap-3 py-2.5">
      <IngredientIcon
        ingredient={ingredient}
        className="size-10 shrink-0"
        sizes="40px"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{ingredient.name}</p>
        {ingredient.origin && (
          <p className="truncate font-mono text-[10px] text-black/40">
            {ingredient.origin}
          </p>
        )}
      </div>
      <input
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
          schedule(e.target.value);
        }}
        onBlur={flush}
        placeholder="amount"
        aria-label={`Amount of ${ingredient.name}`}
        className="w-24 bg-transparent text-right font-mono text-base outline-none placeholder:text-black/25"
      />
      <button
        type="button"
        aria-label={`Remove ${ingredient.name}`}
        onClick={onRemove}
        className="-mr-1 shrink-0 p-1 text-black/30 hover:text-black"
      >
        <X size={15} strokeWidth={1.25} />
      </button>
    </li>
  );
}
