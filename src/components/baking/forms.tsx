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

export function LockButton() {
  return (
    <form action={lock}>
      <TextButton type="submit">lock editing</TextButton>
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
