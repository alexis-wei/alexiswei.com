import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * Returns true only after the component has mounted on the client.
 * Uses useSyncExternalStore so React knows the server/client snapshots differ
 * without triggering an extra re-render cycle (unlike useEffect + setState).
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
