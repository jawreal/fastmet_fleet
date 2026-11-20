"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { RequestsRail } from "@/components/requests/RequestsRail";
import {
  RequestsPanel,
  type RequestsTab,
} from "@/components/requests/RequestsPanel";
import { useRequestsUI } from "@/components/requests/RequestsProvider";
import { useRequestOverlay } from "@/hooks/use-request-overlay";
import {
  selectVehicleSections,
  selectUniqueRequestCount,
  vehicleTypeId,
  type RequestSummary,
  type RequestVehicleType,
  type Vehicle,
} from "@/lib/requestTypes";

export type RequestsSidebarProps = {
  requests: RequestSummary[];
  vehicles: Vehicle[];
  onGoOnDuty: (type: RequestVehicleType) => void;
  now: number | null;
  pulse?: number;
  onMakeOffer: (request: RequestSummary) => void;
  onViewAll: () => void;
  onTabChange: (tab: RequestsTab) => void;
  onHowItWorks: () => void;
  onSimulate?: () => void;
};

// All request data and actions enter as props; this component only coordinates presentation.
export function RequestsSidebar({
  requests,
  vehicles,
  onGoOnDuty,
  now,
  pulse = 0,
  onMakeOffer,
  onViewAll,
  onTabChange,
  onHowItWorks,
  onSimulate,
}: Readonly<RequestsSidebarProps>) {
  const { state, setState, toggle } = useRequestsUI();
  const overlay = useRequestOverlay();
  const [tab, setTab] = useState<RequestsTab>("open");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const previous = useRef(state);
  const open = state !== "collapsed";
  // Both surfaces derive their totals from the same sections without storing a second count.
  const sections = selectVehicleSections(vehicles, requests);
  const count = selectUniqueRequestCount(sections);
  const actionable = sections.filter((section) => section.requests.length > 0);

  // Keep the off-duty nudge independent from matching copies and from the panel total.
  const matchedIds = new Set(
    actionable.flatMap((section) =>
      section.requests.map((request) => request.id),
    ),
  );
  const waitingByType = new Map<
    string,
    { vehicleType: RequestVehicleType; count: number }
  >();
  for (const request of requests) {
    if (matchedIds.has(request.id)) continue;
    matchedIds.add(request.id);
    const key = vehicleTypeId(request.vehicleType);
    const waiting = waitingByType.get(key);
    if (waiting) waiting.count += 1;
    else waitingByType.set(key, { vehicleType: request.vehicleType, count: 1 });
  }
  useEffect(() => {
    // The shared sheet handles trapping focus, Escape, background inertness and restoration.
    // Desktop uses ordinary aside focus so page content stays keyboard-accessible.
    if (!overlay && open) panelRef.current?.focus();
    if (!open && previous.current !== "collapsed") triggerRef.current?.focus();
    previous.current = state;
  }, [state, open, overlay]);
  const panelProps = {
    state,
    sections,
    waitingByType: [...waitingByType.values()],
    onGoOnDuty,
    count,
    now,
    pulse,
    tab,
    panelRef,
    onCollapse: () => setState("collapsed"),
    onMakeOffer,
    onViewAll,
    onHowItWorks,
    onSimulate,
    onTabChange: (next: RequestsTab) => {
      setTab(next);
      onTabChange(next);
    },
  };
  const rail = (
    <RequestsRail
      sections={actionable}
      count={count}
      now={now}
      pulse={pulse}
      triggerRef={triggerRef}
      onToggle={toggle}
      onMakeOffer={onMakeOffer}
      onSimulate={onSimulate}
    />
  );
  return (
    <div className="requests-slot">
      {/* CSS renders a rail immediately below 1280px, even before the viewport hook hydrates. */}
      {state === "collapsed" ? (
        rail
      ) : (
        <>
          <div className="requests-overlay-rail h-full flex-col">{rail}</div>
          {!overlay && (
            <div className="requests-desktop-panel h-full flex-col">
              <RequestsPanel {...panelProps} />
            </div>
          )}
        </>
      )}
      {overlay && (
        <Sheet
          open={open}
          onOpenChange={(next) => {
            if (!next) setState("collapsed");
          }}
        >
          <SheetContent
            className="requests-sheet"
            data-expanded={state === "expanded"}
            showCloseButton={false}
            initialFocus={panelRef}
            finalFocus={triggerRef}
          >
            <SheetTitle className="sr-only">Requests</SheetTitle>
            <SheetDescription className="sr-only">
              Matching requests. Escape closes this panel.
            </SheetDescription>
            <RequestsPanel {...panelProps} />
          </SheetContent>
        </Sheet>
      )}
      {/* Only count changes are announced; the ticking time-left labels never spam this region. */}
      <output aria-live="polite" aria-atomic="true" className="sr-only">
        {count} actionable request{count === 1 ? "" : "s"}
      </output>
    </div>
  );
}
