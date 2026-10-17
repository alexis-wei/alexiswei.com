"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// A tiny page-wide store so the header can show "saving…" / "saved" for
// every autosaving field at once.

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const dirty = new Set<symbol>();
const listeners = new Set<() => void>();
let inFlight = 0;
let failed = false;
let savedOnce = false;
let status: SaveStatus = "idle";

function emit() {
  status = failed
    ? "error"
    : dirty.size > 0 || inFlight > 0
      ? "saving"
      : savedOnce
        ? "saved"
        : "idle";
  listeners.forEach((listener) => listener());
}

/** Wraps a save so it shows up in the page's save status. */
export async function track<T>(promise: Promise<T>): Promise<T> {
  inFlight++;
  emit();
  try {
    const result = await promise;
    failed = false;
    savedOnce = true;
    return result;
  } catch (error) {
    failed = true;
    throw error;
  } finally {
    inFlight--;
    emit();
  }
}

export const hasUnsavedChanges = () => dirty.size > 0 || inFlight > 0;

export function useSaveStatus() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => status,
    () => "idle" as SaveStatus,
  );
}

/**
 * Debounced, ordered saving for one field. Only the latest value is sent,
 * one request at a time; failures retry until they succeed. Pending edits
 * are flushed when the field unmounts or the page is hidden (e.g. switching
 * apps on a phone).
 */
export function useAutosave<T>(
  save: (value: T) => Promise<unknown>,
  delay = 600,
) {
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });

  const [saver] = useState(() => {
    const id = Symbol();
    let queued: { value: T } | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let running = false;

    async function run() {
      clearTimeout(timer);
      timer = undefined;
      if (running) return; // picked up when the current save finishes
      const next = queued;
      if (!next) return;
      queued = null;
      running = true;
      let ok = true;
      try {
        await track(saveRef.current(next.value));
      } catch {
        ok = false;
        queued ??= next;
      } finally {
        running = false;
        if (queued) timer = setTimeout(run, ok ? 0 : 3000);
        else {
          dirty.delete(id);
          emit();
        }
      }
    }

    return {
      schedule(value: T) {
        queued = { value };
        dirty.add(id);
        emit();
        clearTimeout(timer);
        timer = setTimeout(run, delay);
      },
      flush: run,
    };
  });

  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === "hidden") saver.flush();
    };
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", saver.flush);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", saver.flush);
      saver.flush();
    };
  }, [saver]);

  return saver;
}

/** Warns before closing the tab while edits are still being saved. */
export function useUnsavedChangesWarning() {
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) event.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);
}
