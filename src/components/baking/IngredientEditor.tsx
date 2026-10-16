"use client";

import Link from "next/link";
import { useState } from "react";
import {
  deleteIngredient,
  setIngredientImage,
  updateIngredient,
} from "@/app/baking/actions";
import { formatDate } from "@/lib/baking/format";
import type {
  Ingredient,
  IngredientPatch,
  IngredientUsage,
} from "@/lib/baking/types";
import { track, useUnsavedChangesWarning } from "./autosave";
import { BackLink } from "./BakingHeader";
import { IconPicker, uploadIcon, type PickedIcon } from "./IconPicker";
import { IngredientIcon } from "./IngredientIcon";
import {
  AutosaveText,
  Label,
  SaveIndicator,
  Section,
  TextButton,
  TextSection,
} from "./ui";

export function IngredientEditor({
  ingredient,
  usage,
  editable,
}: {
  ingredient: Ingredient;
  usage: IngredientUsage[];
  editable: boolean;
}) {
  useUnsavedChangesWarning();
  const save = (patch: IngredientPatch) =>
    updateIngredient(ingredient.id, patch);
  const [image, setImage] = useState({
    imageUrl: ingredient.imageUrl,
    sourceUrl: ingredient.sourceUrl,
    crop: ingredient.crop,
  });
  const [deleting, setDeleting] = useState(false);

  async function changeImage(icon: PickedIcon) {
    const previous = image;
    setImage({ ...image, imageUrl: icon.url, crop: icon.crop });
    try {
      const saved = await track(
        setIngredientImage(ingredient.id, await uploadIcon(icon)),
      );
      // Keep showing the local preview; it's identical to what was uploaded.
      setImage({ ...saved, imageUrl: icon.url });
    } catch {
      setImage(previous);
    }
  }

  return (
    <article>
      <header className="sticky top-0 z-20 -mx-4 border-b border-black/10 bg-white/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="flex h-14 items-center justify-between">
          <BackLink href="/baking/ingredients">ingredients</BackLink>
          {editable && <SaveIndicator />}
        </div>
      </header>

      <div className="flex flex-col gap-6 pt-8 pb-6 sm:flex-row sm:items-start">
        <div className="w-44 shrink-0">
          {editable ? (
            <IconPicker
              src={image.imageUrl}
              sourceUrl={image.sourceUrl}
              crop={image.crop}
              onIcon={changeImage}
            />
          ) : (
            <IngredientIcon
              ingredient={{ name: ingredient.name, imageUrl: image.imageUrl }}
              className="border border-black/10"
              sizes="176px"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {editable ? (
            <AutosaveText
              initial={ingredient.name}
              onSave={(name) => save({ name })}
              singleLine
              autoFocus={!ingredient.name}
              placeholder="ingredient name"
              aria-label="Name"
              className="font-serif text-[28px] leading-tight"
            />
          ) : (
            <p className="font-serif text-[28px] leading-tight">
              {ingredient.name || "untitled"}
            </p>
          )}
        </div>
      </div>

      <TextSection
        label="where it's from"
        initial={ingredient.origin}
        editable={editable}
        singleLine
        placeholder="brand, shop, farm, country…"
        onSave={(origin) => save({ origin })}
      />
      <TextSection
        label="how it's made"
        initial={ingredient.details}
        editable={editable}
        placeholder="milling, culturing, fat %, process notes…"
        onSave={(details) => save({ details })}
      />

      {usage.length > 0 && (
        <Section
          label={`used in ${usage.length} ${usage.length === 1 ? "log" : "logs"}`}
        >
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
                  {use.amount && (
                    <span className="font-mono text-xs text-black/50">
                      {use.amount}
                    </span>
                  )}
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
          <TextButton
            disabled={deleting}
            className="hover:text-red-600"
            onClick={async () => {
              const where = usage.length
                ? ` It will be removed from ${usage.length} ${usage.length === 1 ? "log" : "logs"}.`
                : "";
              if (!confirm(`Delete this ingredient?${where}`)) return;
              setDeleting(true);
              await track(deleteIngredient(ingredient.id)).catch(() =>
                setDeleting(false),
              );
            }}
          >
            {deleting ? "deleting…" : "delete ingredient"}
          </TextButton>
        </div>
      )}
    </article>
  );
}
