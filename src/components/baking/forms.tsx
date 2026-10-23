"use client";

import { Plus } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { lock, unlock } from "@/app/baking/actions";
import { LineButton, TextButton } from "./ui";

function NewSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <LineButton type="submit" disabled={pending} className="shrink-0">
      <Plus size={14} strokeWidth={1.25} />
      {pending ? "…" : "new"}
      <span className="sr-only sm:not-sr-only">{label}</span>
    </LineButton>
  );
}

/** "+ new" header button; spells out what it creates on wider screens. */
export function NewButton({
  action,
  label,
}: {
  action: () => Promise<void>;
  label: string;
}) {
  return (
    <form action={action}>
      <NewSubmit label={label} />
    </form>
  );
}

function DoneSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="border border-black/15 bg-white/90 px-4 py-2 font-mono text-[11px] tracking-[0.1em] text-black/70 uppercase backdrop-blur transition-colors hover:border-black hover:text-black disabled:opacity-40"
    >
      {pending ? "locking…" : "done editing"}
    </button>
  );
}

/**
 * Pinned to the bottom of every /baking page while editing, so editing can
 * be ended from anywhere without scrolling. Ends the editor session.
 */
export function DoneEditingButton() {
  return (
    <form
      action={lock}
      className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-30 flex justify-center pointer-events-none [&>*]:pointer-events-auto"
    >
      <DoneSubmit />
    </form>
  );
}

export function UnlockForm() {
  const [error, action, pending] = useActionState(unlock, null);
  return (
    <form action={action} className="mt-10 max-w-xs">
      <label className="block">
        <span className="font-mono text-[10px] tracking-[0.14em] text-black/45 uppercase">
          passcode
        </span>
        <input
          name="passcode"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          className="mt-2 w-full border-b border-black/20 bg-transparent pb-2 text-base outline-none focus:border-black"
        />
      </label>
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      <LineButton type="submit" disabled={pending} className="mt-6">
        {pending ? "checking…" : "unlock editing"}
      </LineButton>
    </form>
  );
}

function RestoreSubmit() {
  const { pending } = useFormStatus();
  return (
    <TextButton type="submit" disabled={pending}>
      {pending ? "restoring…" : "restore"}
    </TextButton>
  );
}

export function RestoreButton({ action }: { action: () => Promise<void> }) {
  return (
    <form action={action}>
      <RestoreSubmit />
    </form>
  );
}
