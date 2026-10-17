import Image from "next/image";
import type { Ingredient } from "@/lib/baking/types";
import { cn } from "@/lib/utils";

/** Square ingredient image (or its initial when there's no image yet). */
export function IngredientIcon({
  ingredient,
  className,
  sizes = "96px",
}: {
  ingredient: Pick<Ingredient, "name" | "imageUrl">;
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
        <span className="absolute inset-0 flex items-center justify-center font-serif text-lg text-black/25">
          {ingredient.name.slice(0, 1) || "·"}
        </span>
      )}
    </div>
  );
}
