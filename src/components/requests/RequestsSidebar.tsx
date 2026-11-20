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
import type { RequestSummary } from "@/lib/requestFixtures";

export type RequestsSidebarProps = {
  requests: RequestSummary[];
  count: number;
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
  count,
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
  // Sorting here is presentation order, independent from any future fulfillment rules.
  const summaries = [...requests].sort(
    (a, b) => Date.parse(a.expiresAt) - Date.parse(b.expiresAt),
  );
  useEffect(() => {
    // The shared sheet handles trapping focus, Escape, background inertness and restoration.
    // Desktop uses ordinary aside focus so page content stays keyboard-accessible.
    if (!overlay && open) panelRef.current?.focus();
    if (!open && previous.current !== "collapsed") triggerRef.current?.focus();
    previous.current = state;
  }, [state, open, overlay]);
  const panelProps = {
    state,
    requests: summaries,
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
      requests={summaries}
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
        {count} matching request{count === 1 ? "" : "s"}
      </output>
    </div>
  );
}
