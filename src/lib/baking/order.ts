// Pure list-ordering helpers for drag-to-reorder (kept separate so they're
// easy to test).

/** Returns a copy of `list` with the item at `from` moved to index `to`. */
export function moveItem<T>(list: readonly T[], from: number, to: number) {
  const next = [...list];
  if (from < 0 || from >= next.length) return next;
  const [item] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(to, next.length)), 0, item);
  return next;
}

/**
 * Where a dragged item belongs, given the vertical midpoints of the *other*
 * items (top to bottom) and the pointer's y: the number of items it's below.
 */
export function dropIndex(otherMidpoints: readonly number[], pointerY: number) {
  return otherMidpoints.filter((mid) => mid < pointerY).length;
}

/** True when two id lists are in the same order. */
export const sameOrder = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((id, i) => id === b[i]);

/**
 * A log's cover: the chosen one if it's still there, otherwise the first
 * photo, otherwise the first item (a video). Matches the logs list query.
 */
export function effectiveCover<T extends { id: string; kind: string }>(
  items: readonly T[],
  coverId: string | null,
): T | undefined {
  return (
    items.find((m) => m.id === coverId) ??
    items.find((m) => m.kind === "image") ??
    items[0]
  );
}
