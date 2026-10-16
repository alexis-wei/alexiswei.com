import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "logs", href: "/baking", label: "logs" },
  { key: "ingredients", href: "/baking/ingredients", label: "ingredients" },
] as const;

export function BakingHeader({
  active,
  action,
}: {
  active: (typeof TABS)[number]["key"];
  action?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 -mx-4 border-b border-black/10 bg-white/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-3">
        <nav className="flex items-baseline gap-5">
          <Link href="/baking" className="font-serif text-xl">
            baking
          </Link>
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={active === tab.key ? "page" : undefined}
              className={cn(
                "font-mono text-[11px] tracking-[0.1em] uppercase underline-offset-[6px] transition-colors",
                active === tab.key
                  ? "text-black underline decoration-1"
                  : "text-black/40 hover:text-black",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        {action}
      </div>
    </header>
  );
}

/** Small back link used in the header of detail pages. */
export function BackLink({
  href,
  children,
}: {
  href: string;
  children: string;
}) {
  return (
    <Link
      href={href}
      className="-ml-1 inline-flex items-center gap-1.5 p-1 text-sm text-black/60 hover:text-black"
    >
      <ArrowLeft size={16} strokeWidth={1.25} /> {children}
    </Link>
  );
}
