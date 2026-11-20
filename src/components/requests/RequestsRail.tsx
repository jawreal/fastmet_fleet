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
import { RequestCard, timeLeft } from "@/components/requests/RequestCard";
import {
  vehicleTypeLabel,
  type RequestSummary,
  type VehicleSection,
} from "@/lib/requestTypes";

interface IRequestsRail {
  sections: VehicleSection[];
  count: number;
  now: number | null;
  pulse: number;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onToggle: () => void;
  onMakeOffer: (request: RequestSummary) => void;
  onSimulate?: () => void;
}

interface IVehicleTile {
  section: VehicleSection;
  pulse: number;
  now: number | null;
  onMakeOffer: (request: RequestSummary) => void;
}

export function RequestsRail({
  sections,
  count,
  now,
  pulse,
  triggerRef,
  onToggle,
  onMakeOffer,
  onSimulate,
}: Readonly<IRequestsRail>) {
  // The overflow chip counts hidden vehicle sections. The header badge counts distinct requests.
  const remaining = Math.max(0, sections.length - 3);
  return (
    <div className="requests-rail">
      <div className="requests-header relative">
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
        {count > 0 && (
          <span
            key={pulse}
            aria-label={`${count} unique request${count === 1 ? "" : "s"}`}
            className={`pointer-events-none absolute top-1 right-1 rounded-full bg-muted px-1 text-[9px] tabular-nums ${pulse ? "requests-pulse" : ""}`}
          >
            {count}
          </span>
        )}
      </div>
      {count === 0 ? (
        <InboxIcon
          aria-label="No actionable requests"
          className="size-5 text-muted-foreground/40"
        />
      ) : (
        sections
          .slice(0, 3)
          .map((section) => (
            <VehicleTile
              key={section.vehicle.plate}
              section={section}
              now={now}
              pulse={pulse}
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
          aria-label={`${remaining} more vehicles with requests`}
        >
          {remaining > 99 ? "99+" : `+${remaining}`}
        </button>
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

function VehicleTile({
  section,
  now,
  pulse,
  onMakeOffer,
}: Readonly<IVehicleTile>) {
  // The selector orders requests by expiry so the first card drives the ring and flyout.
  const { vehicle } = section;
  const description = vehicle.model || vehicle.vehicleType.name;
  const driver = vehicle.driver
    ? `Driver: ${vehicle.driver.name}`
    : "No driver assigned";
  const count = section.requests.length;
  const request = section.requests[0];
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
        aria-label={`${description}, ${vehicle.plate}, ${driver}, ${count} ongoing request${count === 1 ? "" : "s"}, soonest expiry: ${timeLeft(request, now)}, open requests`}
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
        {vehicleTypeLabel(vehicle.vehicleType)}
        <span
          key={pulse}
          className={`requests-type-count ${pulse ? "requests-pulse" : ""}`}
          aria-hidden="true"
        >
          {count}
        </span>
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
        <div className="min-w-0">
          <p className="text-sm font-semibold">{description}</p>
          <p className="text-xs text-muted-foreground">{vehicle.plate}</p>
          <p className="mt-1 text-xs text-muted-foreground">{driver}</p>
        </div>
        <RequestCard request={request} now={now} onMakeOffer={onMakeOffer} />
      </PopoverContent>
    </Popover>
  );
}
