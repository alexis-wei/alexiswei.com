import type { Metadata } from "next";
import { createBlankIngredient } from "@/app/baking/actions";
import { BakingHeader } from "@/components/baking/BakingHeader";
import { NewButton } from "@/components/baking/forms";
import { IngredientLibrary } from "@/components/baking/IngredientGrid";
import { isEditor } from "@/lib/baking/auth";
import { listIngredients } from "@/lib/baking/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "ingredients | baking" };

export default async function IngredientsPage() {
  const [ingredients, editor] = await Promise.all([
    listIngredients(),
    isEditor(),
  ]);
  return (
    <>
      <BakingHeader
        active="ingredients"
        action={
          editor && (
            <NewButton action={createBlankIngredient} label="ingredient" />
          )
        }
      />
      <p className="pt-8 pb-6 font-mono text-[10px] tracking-[0.14em] text-black/45 uppercase">
        {ingredients.length}{" "}
        {ingredients.length === 1 ? "ingredient" : "ingredients"}
      </p>
      <IngredientLibrary ingredients={ingredients} />
    </>
  );
}
