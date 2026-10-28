import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MoreMenu } from "./MoreMenu";

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

const footerLink =
  "font-mono text-[11px] tracking-[0.1em] text-black/30 uppercase hover:text-black";

/**
 * Bottom of the list pages: a quiet "edit" link for visitors. (Editors get
 * the pinned "done editing" button from the layout instead.)
 */
export function BakingFooter({ editor }: { editor: boolean }) {
  if (editor) return null;
  return (
    <footer className="mt-12 flex justify-center gap-6">
      <Link href="/baking/edit" className={footerLink}>
        edit
      </Link>
    </footer>
  );
}

/** "12 experiments" line under the header, with the editor's ⋮ menu beside it. */
export function CountLine({
  count,
  noun,
  editor,
}: {
  count: number;
  noun: [singular: string, plural: string];
  editor: boolean;
}) {
  return (
    <div className="flex items-center gap-3 pt-8 pb-6">
      <p className="font-mono text-[10px] tracking-[0.14em] text-black/45 uppercase">
        {count} {count === 1 ? noun[0] : noun[1]}
      </p>
      {editor && (
        <MoreMenu
          items={[{ href: "/baking/deleted", label: "recently deleted" }]}
        />
      )}
    </div>
  );
}
