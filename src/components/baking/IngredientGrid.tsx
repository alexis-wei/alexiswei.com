"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Ingredient } from "@/lib/baking/types";
import { cn } from "@/lib/utils";
import { IngredientIcon } from "./IngredientIcon";

export const matchesQuery = (ingredient: Ingredient, query: string) => {
  const q = query.trim().toLowerCase();
  return (
    !q ||
    ingredient.name.toLowerCase().includes(q) ||
    ingredient.origin.toLowerCase().includes(q)
  );
};

export function SearchInput({
  value,
  onChange,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoFocus={autoFocus}
      placeholder="search ingredients"
      enterKeyHint="search"
      className="w-full border-b border-black/15 bg-transparent pb-2 text-base outline-none placeholder:text-black/25 focus:border-black"
    />
  );
}

/** One square ingredient tile. Renders as a link or a toggle button. */
export function IngredientTile({
  ingredient,
  href,
  selected,
  onClick,
}: {
  ingredient: Ingredient;
  href?: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  const body = (
    <>
      <div
        className={cn(
          "relative border transition-colors",
          selected
            ? "border-black"
            : "border-black/10 group-hover:border-black/40",
        )}
      >
        <IngredientIcon
          ingredient={ingredient}
          className="m-1.5"
          sizes="120px"
        />
        {selected && (
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center bg-black text-white">
            <Check size={11} strokeWidth={2} />
          </span>
        )}
      </div>
      <p className="mt-1.5 truncate text-[13px] leading-tight">
        {ingredient.name || "untitled"}
      </p>
      {ingredient.origin && (
        <p className="mt-0.5 truncate font-mono text-[10px] text-black/40">
          {ingredient.origin}
        </p>
      )}
    </>
  );
  return href ? (
    <Link href={href} className="group block">
      {body}
    </Link>
  ) : (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className="group block w-full text-left"
    >
      {body}
    </button>
  );
}

/** The ingredients page: every ingredient, searchable, each linking to its page. */
export function IngredientLibrary({
  ingredients,
}: {
  ingredients: Ingredient[];
}) {
  const [query, setQuery] = useState("");
  const visible = ingredients.filter((i) => matchesQuery(i, query));
  return (
    <div>
      {ingredients.length > 8 && (
        <div className="mb-6">
          <SearchInput value={query} onChange={setQuery} />
        </div>
      )}
      {visible.length === 0 ? (
        <p className="py-12 text-center text-sm text-black/40">
          {query ? "no matches" : "no ingredients yet"}
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-5">
          {visible.map((ingredient) => (
            <li key={ingredient.id}>
              <IngredientTile
                ingredient={ingredient}
                href={`/baking/ingredients/${ingredient.id}`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
