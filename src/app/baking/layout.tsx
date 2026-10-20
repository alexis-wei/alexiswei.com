import type { Metadata, Viewport } from "next";

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

export default function BakingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-white text-black">
      <div className="mx-auto max-w-2xl px-4 pb-[calc(env(safe-area-inset-bottom)+3rem)]">
        {children}
      </div>
    </div>
  );
}
