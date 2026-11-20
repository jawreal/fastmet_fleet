"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { RequestsSidebar } from "@/components/requests/RequestsSidebar";
import { useRequestsUI } from "@/components/requests/RequestsProvider";
import {
  fixtureCounts,
  fixtureEpoch,
  getRequestFixture,
  getSimulatedRequest,
  type FixtureCount,
} from "@/lib/requestFixtures";

// No-op callback boundary: real offer/composer behavior is deliberately outside this UI phase.
const noop = () => {};

export function RequestsPreview() {
  const { setState } = useRequestsUI();
  const pathname = usePathname();
  const [requests, setRequests] = useState(() => getRequestFixture(7));
  const [count, setCount] = useState(7);
  const [now, setNow] = useState<number | null>(null);
  const [pulse, setPulse] = useState(0);
  const epoch = useRef(fixtureEpoch);
  const selectedCount = useRef<FixtureCount>(7);
  const sequence = useRef(0);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // Initialize clocks only after mount. The server and first hydration render stay neutral.
    epoch.current = Date.now();
    // Strict Mode replays mount effects; retain the query-selected fixture on replay.
    setRequests(getRequestFixture(selectedCount.current, epoch.current));
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 15_000);
    return () => {
      clearInterval(timer);
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
    };
  }, []);
  useEffect(() => {
    // This whole query-parameter branch is eliminated by production compilation.
    if (process.env.NODE_ENV !== "development") return;
    const applyFixture = () => {
      const value = new URLSearchParams(window.location.search).get("requests");
      const parsed = Number(value);
      const next =
        value !== null && fixtureCounts.includes(parsed as FixtureCount)
          ? (parsed as FixtureCount)
          : 7;
      // Navigation with the same fixture retains a simulated arrival and its original expiry.
      if (next === selectedCount.current) return;
      selectedCount.current = next;
      setRequests(getRequestFixture(next, epoch.current));
      setCount(next);
    };
    applyFixture();
    window.addEventListener("popstate", applyFixture);
    return () => window.removeEventListener("popstate", applyFixture);
  }, [pathname]);
  return (
    <RequestsSidebar
      requests={requests}
      count={count}
      now={now}
      pulse={pulse}
      onMakeOffer={noop}
      onTabChange={noop}
      onHowItWorks={noop}
      onViewAll={() => setState("expanded")}
      onSimulate={
        process.env.NODE_ENV === "development"
          ? () => {
              // Feedback changes only fixture data/count. It never touches pinned/collapsed state.
              sequence.current += 1;
              setRequests((current) => [
                getSimulatedRequest(Date.now(), sequence.current),
                ...current,
              ]);
              setCount((current) => current + 1);
              setPulse(sequence.current);
              // One stable toast ID coalesces repeated clicks, with no sound or connection involved.
              toast("1 new matching request", {
                id: "request-preview-arrival",
              });
              if (pulseTimer.current) clearTimeout(pulseTimer.current);
              pulseTimer.current = setTimeout(() => setPulse(0), 2200);
            }
          : undefined
      }
    />
  );
}
