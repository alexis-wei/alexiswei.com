import Image from "next/image";
import Link from "next/link";
import { createLog } from "@/app/baking/actions";
import { BakingFooter, BakingHeader } from "@/components/baking/BakingHeader";
import { NewButton } from "@/components/baking/forms";
import { IngredientIcon } from "@/components/baking/IngredientIcon";
import { isEditor } from "@/lib/baking/auth";
import { formatDate, formatDuration } from "@/lib/baking/format";
import { listLogs } from "@/lib/baking/queries";
import type { LogSummary } from "@/lib/baking/types";

export const dynamic = "force-dynamic";

export default async function BakingPage() {
  const [logs, editor] = await Promise.all([listLogs(), isEditor()]);

  return (
    <>
      <BakingHeader
        active="logs"
        action={editor && <NewButton action={createLog} label="log" />}
      />

      <p className="pt-8 pb-6 font-mono text-[10px] tracking-[0.14em] text-black/45 uppercase">
        {logs.length} {logs.length === 1 ? "experiment" : "experiments"}
      </p>

      {logs.length === 0 ? (
        <p className="border-t border-black/10 py-16 text-center text-sm text-black/40">
          {editor ? "nothing baked yet — start a new log" : "nothing baked yet"}
        </p>
      ) : (
        <ul className="border-t border-black/10">
          {logs.map((log) => (
            <LogRow key={log.id} log={log} />
          ))}
        </ul>
      )}

      <BakingFooter editor={editor} />
    </>
  );
}

function LogRow({ log }: { log: LogSummary }) {
  const extra = log.ingredients.length - 6;
  return (
    <li className="border-b border-black/10">
      <Link
        href={`/baking/${log.id}`}
        className="flex items-center gap-4 py-4 transition-colors active:bg-black/[0.02]"
      >
        <div className="relative size-20 shrink-0 overflow-hidden bg-black/[0.03]">
          {log.cover?.kind === "image" && (
            <Image
              src={log.cover.url}
              alt=""
              fill
              unoptimized
              sizes="80px"
              className="object-cover"
            />
          )}
          {log.cover?.kind === "video" && (
            <video
              src={`${log.cover.url}#t=0.1`}
              muted
              playsInline
              preload="metadata"
              className="size-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] tracking-[0.14em] text-black/45 uppercase">
            {[
              formatDate(log.bakedOn, true),
              formatDuration(log.startTime, log.endTime),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="mt-1 truncate font-serif text-lg leading-snug">
            {log.title || "untitled"}
          </p>
          {log.ingredients.length > 0 && (
            <div className="mt-2 flex items-center gap-1">
              {log.ingredients.slice(0, 6).map((ingredient) => (
                <IngredientIcon
                  key={ingredient.id}
                  ingredient={ingredient}
                  className="size-6"
                  sizes="24px"
                />
              ))}
              {extra > 0 && (
                <span className="ml-1 font-mono text-[10px] text-black/40">
                  +{extra}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}
