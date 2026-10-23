import type { Metadata, Viewport } from "next";
import { DoneEditingButton } from "@/components/baking/forms";
import { isEditor } from "@/lib/baking/auth";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "baking | alexis wei",
  description: "a log of baking experiments",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  viewportFit: "cover",
  // Stops iOS Safari zooming the page when a small (<16px) input is tapped.
  // iOS still allows pinch-zoom regardless of this.
  maximumScale: 1,
};

export default async function BakingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const editor = await isEditor();
  return (
    <div className="min-h-dvh bg-white text-black">
      <div
        className={cn(
          "mx-auto max-w-2xl px-4",
          // Room for the pinned "done editing" button below the last item.
          editor
            ? "pb-[calc(env(safe-area-inset-bottom)+6rem)]"
            : "pb-[calc(env(safe-area-inset-bottom)+3rem)]",
        )}
      >
        {children}
      </div>
      {editor && <DoneEditingButton />}
    </div>
  );
}
