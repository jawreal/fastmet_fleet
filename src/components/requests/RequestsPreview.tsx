"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { RequestsSidebar } from "@/components/requests/RequestsSidebar";
import { useRequestsUI } from "@/components/requests/RequestsProvider";
import {
  getRequestFixture,
  getSimulatedRequest,
  scenarios,
  type RequestScenario,
} from "@/lib/requestFixtures";

const noop = () => {};
// Only development mounts the query reader; production has no scenario override or simulation UI.
export function RequestsPreview() {
  if (process.env.NODE_ENV === "development")
    return (
      <Suspense fallback={null}>
        <ScenarioPreview />
      </Suspense>
    );
  return <PreviewData scenario="mixed" />;
}
function ScenarioPreview() {
  const params = useSearchParams();
  const value = params.get("scenario");
  // Start with the same three-vehicle fixture as production unless a scenario is selected.
  const scenario = scenarios.includes(value as RequestScenario)
    ? (value as RequestScenario)
    : "mixed";
  // Key only the fixture boundary: root context keeps cookie/layout state across scenario changes.
  return <PreviewData key={scenario} scenario={scenario} />;
}
function PreviewData({ scenario }: Readonly<{ scenario: RequestScenario }>) {
  const { setState } = useRequestsUI();
  const [fixture, setFixture] = useState(() => getRequestFixture(scenario));
  const [now, setNow] = useState<number | null>(null);
  const [pulse, setPulse] = useState(0);
  const sequence = useRef(0);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // Server clocks remain neutral. Strict Mode can safely replay this same scenario initialization.
    const frame = requestAnimationFrame(() => {
      setFixture(getRequestFixture(scenario, Date.now()));
      setNow(Date.now());
    });
    const timer = setInterval(() => setNow(Date.now()), 15_000);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(timer);
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
    };
  }, [scenario]);
  return (
    <RequestsSidebar
      requests={fixture.requests}
      vehicles={fixture.vehicles}
      now={now}
      pulse={pulse}
      onMakeOffer={noop}
      onTabChange={noop}
      onHowItWorks={noop}
      onGoOnDuty={noop}
      onViewAll={() => setState("expanded")}
      onSimulate={
        process.env.NODE_ENV === "development"
          ? () => {
              sequence.current += 1;
              // Add a request for an existing preview type; never create vehicles or change their duty.
              const vehicleType =
                fixture.requests[0]?.vehicleType ??
                fixture.vehicles[0]?.vehicleType;
              setFixture((current) => ({
                ...current,
                requests: [
                  getSimulatedRequest(
                    Date.now(),
                    sequence.current,
                    vehicleType,
                  ),
                  ...current.requests,
                ],
              }));
              setPulse(sequence.current);
              toast("1 new request", { id: "request-preview-arrival" });
              if (pulseTimer.current) clearTimeout(pulseTimer.current);
              pulseTimer.current = setTimeout(() => setPulse(0), 2200);
            }
          : undefined
      }
    />
  );
}
