"use client";

import { useEffect } from "react";

const visibilityThreshold = 0.2;

export function FleetReveal({ rootId }: Readonly<{ rootId: string }>) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    const sample = root?.querySelector("[data-fleet-motion]");
    if (!root || !sample || root.dataset.fleetReveal === "off") return;

    // If the CSS fallback already showed the content, keep it visible.
    if (
      !("IntersectionObserver" in window) ||
      (root.dataset.fleetReveal !== "ready" &&
        getComputedStyle(sample).opacity !== "0")
    ) {
      root.dataset.fleetReveal = "off";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const { intersectionRatio, target } of entries) {
          if (
            intersectionRatio < visibilityThreshold ||
            !(target instanceof HTMLElement)
          ) {
            continue;
          }

          target.dataset.fleetVisible = "";
          observer.unobserve(target);
        }
      },
      { threshold: visibilityThreshold, rootMargin: "0px 0px -50px 0px" },
    );

    root.dataset.fleetReveal = "ready";
    root
      .querySelectorAll("[data-fleet-section]:not([data-fleet-visible])")
      .forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [rootId]);

  return null;
}
