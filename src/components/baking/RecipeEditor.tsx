"use client";

import Link from "next/link";
import { deleteRecipe, updateRecipe } from "@/app/baking/actions";
import { formatDate } from "@/lib/baking/format";
import type { Recipe, RecipeUsage } from "@/lib/baking/types";
import { useUnsavedChangesWarning } from "./autosave";
import { BackLink } from "./BakingHeader";
import { RecipeSection } from "./RecipeSection";
import {
  AutosaveText,
  ConfirmButton,
  Label,
  SaveIndicator,
  Section,
} from "./ui";

/** A recipe's page: its name, link, pasted text and files, and where it's used. */
export function RecipeEditor({
  recipe,
  usage,
  editable,
}: {
  recipe: Recipe;
  usage: RecipeUsage[];
  editable: boolean;
}) {
  useUnsavedChangesWarning();
  const logs = `${usage.length} ${usage.length === 1 ? "log" : "logs"}`;

  return (
    <article>
      <header className="sticky top-0 z-20 -mx-4 border-b border-black/10 bg-white/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="flex h-14 items-center justify-between">
          <BackLink href="/baking/recipes">recipes</BackLink>
          {editable && <SaveIndicator />}
        </div>
      </header>

      <div className="pt-8 pb-6">
        {editable ? (
          <AutosaveText
            initial={recipe.name}
            onSave={(name) => updateRecipe(recipe.id, { name })}
            singleLine
            autoFocus={!recipe.name}
            placeholder="recipe name"
            aria-label="Name"
            className="font-serif text-[28px] leading-tight"
          />
        ) : (
          <p className="font-serif text-[28px] leading-tight">
            {recipe.name || "untitled"}
          </p>
        )}
      </div>

      <Section label="recipe">
        <RecipeSection recipe={recipe} editable={editable} />
      </Section>

      {usage.length > 0 && (
        <Section label={`used in ${logs}`}>
          <ul className="divide-y divide-black/10 border-y border-black/10">
            {usage.map((use) => (
              <li key={use.logId}>
                <Link
                  href={`/baking/${use.logId}`}
                  className="flex items-baseline gap-3 py-3 hover:text-black/60"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {use.title || "untitled"}
                  </span>
                  <Label className="shrink-0">
                    {formatDate(use.bakedOn, true)}
                  </Label>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {editable && (
        <div className="border-t border-black/10 pt-6">
          <ConfirmButton
            label="delete recipe"
            busyLabel="deleting…"
            note={`${
              usage.length ? `It will disappear from ${logs} too. ` : ""
            }You can restore it from recently deleted for 30 days.`}
            onConfirm={() => deleteRecipe(recipe.id)}
          />
        </div>
      )}
    </article>
  );
}
