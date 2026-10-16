"use client";

import { useLayoutEffect, useRef, useState, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { useAutosave, useSaveStatus } from "./autosave";

export function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-[10px] tracking-[0.14em] text-black/45 uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function Section({
  label,
  children,
  action,
}: {
  label: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="border-t border-black/10 py-6">
      <div className="mb-4 flex min-h-6 items-center justify-between">
        <Label>{label}</Label>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Textarea that grows with its content. */
export function AutoTextarea({
  className,
  value,
  ...props
}: ComponentProps<"textarea"> & { value: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      className={cn(
        "block w-full resize-none overflow-hidden bg-transparent text-base leading-relaxed outline-none placeholder:text-black/25",
        className,
      )}
      {...props}
    />
  );
}

/** A text field that saves itself as you type. */
export function AutosaveText({
  initial,
  onSave,
  singleLine,
  ...props
}: Omit<ComponentProps<"textarea">, "value" | "onChange"> & {
  initial: string;
  onSave: (value: string) => Promise<unknown>;
  singleLine?: boolean;
}) {
  const [value, setValue] = useState(initial);
  const { schedule, flush } = useAutosave(onSave);
  return (
    <AutoTextarea
      value={value}
      onChange={(event) => {
        const next = singleLine
          ? event.target.value.replace(/\n/g, " ")
          : event.target.value;
        setValue(next);
        schedule(next);
      }}
      onKeyDown={(event) => {
        if (singleLine && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      onBlur={flush}
      enterKeyHint={singleLine ? "done" : undefined}
      {...props}
    />
  );
}

export function SaveIndicator() {
  const status = useSaveStatus();
  const text = {
    idle: "",
    saving: "saving…",
    saved: "saved",
    error: "offline · retrying",
  }[status];
  return (
    <span
      aria-live="polite"
      className={cn(
        "font-mono text-[10px] tracking-[0.14em] uppercase transition-opacity",
        status === "error" ? "text-red-600" : "text-black/40",
      )}
    >
      {text}
    </span>
  );
}

export function LineButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 items-center gap-1.5 border border-black/80 px-3 text-sm transition-colors active:bg-black active:text-white disabled:opacity-40 sm:hover:bg-black sm:hover:text-white",
        className,
      )}
      {...props}
    />
  );
}

export function TextButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[11px] tracking-[0.1em] text-black/55 uppercase transition-colors hover:text-black disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

/** A labelled autosaving text section; hidden for visitors when empty. */
export function TextSection({
  label,
  initial,
  editable,
  singleLine,
  placeholder,
  onSave,
}: {
  label: string;
  initial: string;
  editable: boolean;
  singleLine?: boolean;
  placeholder: string;
  onSave: (value: string) => Promise<unknown>;
}) {
  if (!editable && !initial.trim()) return null;
  return (
    <Section label={label}>
      {editable ? (
        <AutosaveText
          initial={initial}
          onSave={onSave}
          singleLine={singleLine}
          placeholder={placeholder}
          aria-label={label}
          className={singleLine ? undefined : "min-h-[4.5rem]"}
        />
      ) : (
        <p className="leading-relaxed whitespace-pre-wrap">{initial}</p>
      )}
    </Section>
  );
}
