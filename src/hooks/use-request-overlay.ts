"use client";

import { useSyncExternalStore } from "react";

// CSS uses the same breakpoint so the first server-rendered frame reserves the correct space.
const query = "(max-width: 1279px)";
const subscribe = (callback: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
// The server snapshot is stable; CSS handles small screens before hydration.
export function useRequestOverlay() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
