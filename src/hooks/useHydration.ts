"use client";

import { useSyncExternalStore } from "react";

/**
 * A hydration-safe hook that returns whether the component has hydrated.
 * Uses useSyncExternalStore to avoid setState-in-useEffect ESLint warnings.
 */
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function useHydration(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );
}
