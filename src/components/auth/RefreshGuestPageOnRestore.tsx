"use client";

import { useEffect } from "react";

export function RefreshGuestPageOnRestore() {
  useEffect(() => {
    function refreshOnRestore(event: PageTransitionEvent) {
      if (event.persisted) window.location.reload();
    }

    window.addEventListener("pageshow", refreshOnRestore);
    return () => window.removeEventListener("pageshow", refreshOnRestore);
  }, []);

  return null;
}
