"use client";

import { useId, useRef, useState } from "react";
import { InboxIcon, PanelRightOpenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RequestDetails, timeLeft } from "@/components/requests/RequestDetails";
import type { RequestSummary } from "@/lib/requestFixtures";

interface IRequestsRail {
  requests: RequestSummary[];
  count: number;
  now: number | null;
  pulse: number;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onToggle: () => void;
  onMakeOffer: (request: RequestSummary) => void;
  onSimulate?: () => void;
}

interface IVehicleTile {
  request: RequestSummary;
  now: number | null;
  onMakeOffer: (request: RequestSummary) => void;
}

export function RequestsRail({
  requests,
  count,
  now,
  pulse,
  triggerRef,
  onToggle,
  onMakeOffer,
  onSimulate,
}: Readonly<IRequestsRail>) {
  // Count is supplied separately; it will remain authoritative when real summaries replace fixtures.
  const remaining = Math.max(0, count - Math.min(requests.length, 3));
  return (
    <div className="requests-rail">
      <div className="requests-header">
        <Button
          ref={triggerRef}
          size="icon-sm"
          variant="ghost"
          onClick={onToggle}
          aria-label="Open requests"
          aria-controls="requests-panel"
          aria-expanded={false}
          aria-keyshortcuts="Alt+Shift+Q"
          title="Requests (Alt+Shift+Q)"
        >
          <PanelRightOpenIcon />
        </Button>
      </div>
      {count === 0 ? (
        <InboxIcon
          aria-label="No matching requests"
          className="size-5 text-muted-foreground/40"
        />
      ) : (
        requests
          .slice(0, 3)
          .map((request) => (
            <VehicleTile
              key={request.id}
              request={request}
              now={now}
              onMakeOffer={onMakeOffer}
            />
          ))
      )}
      {remaining > 0 && (
        <button
          key={pulse}
          type="button"
          className={`requests-count ${pulse ? "requests-pulse" : ""}`}
          onClick={onToggle}
          aria-label={`${remaining} more matching requests`}
        >
          {remaining > 99 ? "99+" : `+${remaining}`}
        </button>
      )}
      {/* With only one to three requests, an arrival pulses a small count rather than inventing overflow. */}
      {count > 0 && remaining === 0 && pulse > 0 && (
        <span
          key={pulse}
          className="requests-count requests-pulse"
          aria-hidden="true"
        >
          {count}
        </span>
      )}
      {onSimulate && (
        <Button
          className="mt-auto mb-16 text-[10px] px-1"
          size="sm"
          variant="ghost"
          onClick={onSimulate}
          aria-label="Simulate new request"
        >
          + New
        </Button>
      )}
    </div>
  );
}

function VehicleTile({ request, now, onMakeOffer }: Readonly<IVehicleTile>) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const triggerId = useId();
  const restoringFocus = useRef(false);
  // Preview rings use a fixed one-hour display window; this is visual scaffolding, not a TTL rule.
  const fraction =
    now === null
      ? 0
      : Math.max(
          0,
          Math.min(1, (Date.parse(request.expiresAt) - now) / 3_600_000),
        );
  return (
    <Popover
      open={open}
      triggerId={triggerId}
      onOpenChange={(next, details) => {
        // Let Base UI own portal focus guards; custom blur handling would close before Tab reaches the CTA.
        restoringFocus.current = !next && details.reason === "escape-key";
        setOpen(next);
      }}
    >
      <PopoverTrigger
        ref={trigger}
        id={triggerId}
        openOnHover
        delay={180}
        closeDelay={200}
        className="requests-tile"
        aria-label={`${request.vehicleName}, ${timeLeft(request, now)}, open request`}
        onFocus={() => {
          // Escape restores focus without immediately reopening the same flyout.
          if (restoringFocus.current) {
            restoringFocus.current = false;
            return;
          }
          setOpen(true);
        }}
      >
        <svg viewBox="0 0 40 44" fill="none" aria-hidden="true">
          <rect
            className="requests-ring-track"
            x="1"
            y="1"
            width="38"
            height="42"
            rx="9"
            strokeWidth="2"
          />
          <rect
            className="requests-ring-progress"
            x="1"
            y="1"
            width="38"
            height="42"
            rx="9"
            strokeWidth="2"
            pathLength="100"
            strokeDasharray={`${fraction * 100} 100`}
          />
        </svg>
        {request.vehicleCode}
      </PopoverTrigger>
      <PopoverContent
        side="left"
        align="start"
        sideOffset={8}
        className="requests-flyout w-72 p-4"
        initialFocus={false}
        finalFocus={trigger}
      >
        <PopoverTitle className="sr-only">Request details</PopoverTitle>
        <PopoverDescription className="sr-only">
          Vehicle, route, pickup time and customer price.
        </PopoverDescription>
        <RequestDetails request={request} now={now} onMakeOffer={onMakeOffer} />
      </PopoverContent>
    </Popover>
  );
}
