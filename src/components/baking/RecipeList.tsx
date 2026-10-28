"use client";

import { Check, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { recipeSummary } from "@/lib/baking/format";
import type { Recipe } from "@/lib/baking/types";
import { cn } from "@/lib/utils";

export const matchesRecipe = (recipe: Recipe, query: string) => {
  const q = query.trim().toLowerCase();
  return (
    !q ||
    recipe.name.toLowerCase().includes(q) ||
    recipe.url.toLowerCase().includes(q)
  );
};

export function RecipeSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="search recipes"
      enterKeyHint="search"
      className="w-full border-b border-black/15 bg-transparent pb-2 text-base outline-none placeholder:text-black/25 focus:border-black"
    />
  );
}

/** The first photo of a recipe as a small square, else a page icon. */
function RecipeMark({ recipe }: { recipe: Recipe }) {
  const photo = recipe.files.find((f) => f.contentType.startsWith("image/"));
  return (
    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden border border-black/10 text-black/35">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.url}
          alt=""
          loading="lazy"
          className="size-full object-cover"
        />
      ) : (
        <FileText size={16} strokeWidth={1} />
      )}
    </span>
  );
}

/** One recipe row: a link to its page, or a toggle in the log's picker. */
export function RecipeRow({
  recipe,
  href,
  selected,
  onClick,
}: {
  recipe: Recipe;
  href?: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  const summary = recipeSummary(recipe);
  const body = (
    <>
      <RecipeMark recipe={recipe} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm">
          {recipe.name || "untitled"}
        </span>
        {summary && (
          <span className="block truncate font-mono text-[10px] text-black/40">
            {summary}
          </span>
        )}
      </span>
      {onClick && (
        <span
          className={cn(
            "flex size-4 shrink-0 items-center justify-center border",
            selected ? "border-black bg-black text-white" : "border-black/25",
          )}
        >
          {selected && <Check size={11} strokeWidth={2} />}
        </span>
      )}
    </>
  );
  const className =
    "flex w-full items-center gap-3 py-2.5 text-left transition-colors hover:text-black/60";
  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={className}
    >
      {body}
    </button>
  );
}

/** The recipes page: every recipe, searchable, each linking to its page. */
export function RecipeLibrary({ recipes }: { recipes: Recipe[] }) {
  const [query, setQuery] = useState("");
  const visible = recipes.filter((r) => matchesRecipe(r, query));
  return (
    <div>
      {recipes.length > 8 && (
        <div className="mb-6">
          <RecipeSearch value={query} onChange={setQuery} />
        </div>
      )}
      {visible.length === 0 ? (
        <p className="border-t border-black/10 py-16 text-center text-sm text-black/40">
          {query ? "no matches" : "no recipes yet"}
        </p>
      ) : (
        <ul className="divide-y divide-black/10 border-y border-black/10">
          {visible.map((recipe) => (
            <li key={recipe.id}>
              <RecipeRow
                recipe={recipe}
                href={`/baking/recipes/${recipe.id}`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
