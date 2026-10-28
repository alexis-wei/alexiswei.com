import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  restoreIngredient,
  restoreLog,
  restoreMedia,
  restoreRecipe,
  restoreRecipeFile,
} from "@/app/baking/actions";
import { BackLink } from "@/components/baking/BakingHeader";
import { RestoreButton } from "@/components/baking/forms";
import { isEditor } from "@/lib/baking/auth";
import { formatDate } from "@/lib/baking/format";
import {
  listDeleted,
  RETENTION_DAYS,
  type DeletedItem,
} from "@/lib/baking/trash";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "recently deleted | baking" };

const RESTORE = {
  log: restoreLog,
  ingredient: restoreIngredient,
  recipe: restoreRecipe,
  media: restoreMedia,
  recipeFile: restoreRecipeFile,
};

const KIND_LABEL = {
  log: "log",
  ingredient: "ingredient",
  recipe: "recipe",
  recipeFile: "recipe file",
};

export default async function DeletedPage() {
  if (!(await isEditor())) redirect("/baking/edit");
  const items = await listDeleted();

  return (
    <>
      <header className="sticky top-0 z-20 -mx-4 border-b border-black/10 bg-white/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="flex h-14 items-center">
          <BackLink href="/baking">logs</BackLink>
        </div>
      </header>

      <div className="pt-8 pb-6">
        <p className="font-serif text-[28px] leading-tight">recently deleted</p>
        <p className="mt-2 text-sm text-black/45">
          Deleted logs, ingredients, recipes, photos and videos are kept for{" "}
          {RETENTION_DAYS} days, then removed for good.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="border-t border-black/10 py-16 text-center text-sm text-black/40">
          nothing here
        </p>
      ) : (
        <ul className="divide-y divide-black/10 border-y border-black/10">
          {items.map((item) => (
            <DeletedRow key={`${item.kind}-${item.id}`} item={item} />
          ))}
        </ul>
      )}
    </>
  );
}

function DeletedRow({ item }: { item: DeletedItem }) {
  const detail =
    item.kind === "log" ? formatDate(item.detail, true) : item.detail;
  return (
    <li className="flex items-center gap-4 py-3">
      <div className="relative size-12 shrink-0 overflow-hidden border border-black/10 bg-white">
        {item.thumbUrl && item.mediaKind === "video" ? (
          <video
            src={`${item.thumbUrl}#t=0.1`}
            muted
            playsInline
            preload="metadata"
            className="size-full object-cover"
          />
        ) : item.thumbUrl ? (
          <Image
            src={item.thumbUrl}
            alt=""
            fill
            unoptimized
            sizes="48px"
            className={
              item.kind === "ingredient" ? "object-contain" : "object-cover"
            }
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] tracking-[0.14em] text-black/45 uppercase">
          {item.kind === "media" ? item.label : KIND_LABEL[item.kind]}
          {" · "}
          {item.daysLeft === 1 ? "1 day left" : `${item.daysLeft} days left`}
        </p>
        <p className="mt-0.5 truncate text-sm">
          {item.kind === "media" ? detail : item.label}
        </p>
        {item.kind !== "media" && detail && (
          <p className="truncate text-xs text-black/40">{detail}</p>
        )}
      </div>
      <RestoreButton action={RESTORE[item.kind].bind(null, item.id)} />
    </li>
  );
}
