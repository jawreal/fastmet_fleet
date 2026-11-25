"use client";

import { useId, useState } from "react";
import { ChevronDownIcon, TriangleAlertIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RequestList } from "@/components/requests/RequestList";
import {
  vehicleTypeLabel,
  type RequestSummary,
  type VehicleSection as Section,
} from "@/lib/requestTypes";

interface VehicleSectionProps {
  section: Section;
  now: number | null;
  onMakeOffer: (request: RequestSummary) => void;
}

function summaryConnector(continues: boolean) {
  // Continuing lines branch right while terminal lines turn toward the row they end at.
  return `pointer-events-none absolute -top-2 -left-9 w-8 border-l border-muted-foreground/40 ${continues ? "bottom-0 after:absolute after:inset-x-0 after:bottom-[calc(50%_-_0.25rem)] after:border-t after:border-muted-foreground/40" : "bottom-1/2 rounded-bl-xl border-b"}`;
}

export function VehicleSection({
  section,
  now,
  onMakeOffer,
}: Readonly<VehicleSectionProps>) {
  const { vehicle, requests } = section;
  const { driver, plate, status, vehicleType } = vehicle;
  const description = vehicle.model || vehicleType.name;
  const count = requests.length;
  const countFormat = count === 1 ? "" : "s";
  const countText = count
    ? `${count} ongoing request${countFormat}`
    : "No ongoing requests";
  const driverText = driver ? `Driver: ${driver.name}` : "No driver assigned";

  // Store the user's choice only. A newly populated section defaults open until it is toggled.
  const [cardsOpen, setCardsOpen] = useState(true);
  const cardsId = useId();
  const headingId = useId();

  return (
    <fieldset
      aria-labelledby={headingId}
      data-vehicle-section={plate}
      className="min-w-0 border-b border-border pb-4 last:border-b-0 last:pb-0"
    >
      {/* The summary stays mounted and visible when the request disclosure closes. */}
      <div className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-start gap-x-2 gap-y-2 py-2">
        <span
          aria-hidden="true"
          className="requests-tile pointer-events-none size-8! self-end text-[10px]"
        >
          {vehicleTypeLabel(vehicleType)}
        </span>
        <h3
          id={headingId}
          className="min-w-0 self-center text-xs leading-snug wrap-anywhere"
        >
          <span className="font-semibold">{description}</span>{" "}
          <span className="inline-block text-[10px] font-normal whitespace-nowrap text-muted-foreground">
            {plate}
          </span>
        </h3>
        <Badge
          variant="secondary"
          className="mt-0.5 gap-1.5 px-1.5 font-normal text-muted-foreground"
        >
          <span
            aria-hidden="true"
            className={`size-1 rounded-full ${status === "On duty" ? "bg-primary" : "bg-muted-foreground"}`}
          />
          {status}
        </Badge>

        {/* Driver identity is secondary to the vehicle and uses the existing initials fallback. */}
        <div className="relative col-start-2 col-span-2 flex min-h-6 min-w-0 items-center gap-2 text-xs">
          {/* Branch at the driver row when the connector continues to the requests. */}
          {(count > 0 || driver) && (
            <span aria-hidden="true" className={summaryConnector(count > 0)} />
          )}
          {driver ? (
            <>
              <Avatar aria-hidden="true" className="size-6 shrink-0">
                <AvatarFallback className="text-[9px]">
                  {driver.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 wrap-anywhere">
                <span className="sr-only">Driver: </span>
                {driver.name}
              </span>
            </>
          ) : (
            <span className="flex items-center gap-2 text-muted-foreground">
              <TriangleAlertIcon
                aria-hidden="true"
                className="size-3.5 text-primary-foreground dark:text-primary"
              />
              {driverText}
            </span>
          )}
        </div>

        {/* Only vehicles with cards get a focusable disclosure control. */}
        {count > 0 ? (
          <button
            type="button"
            aria-label={`${description}, ${plate}, ${driverText}, ${countText}`}
            aria-expanded={cardsOpen}
            aria-controls={cardsId}
            onClick={() => setCardsOpen((open) => !open)}
            className="relative col-start-2 col-span-2 flex min-h-7 items-center justify-between gap-2 rounded-sm text-left text-xs font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-ring dark:text-primary"
          >
            {/* The trunk stops at the count while the request cards are collapsed. */}
            <span aria-hidden="true" className={summaryConnector(cardsOpen)} />
            {countText}
            <ChevronDownIcon
              aria-hidden="true"
              className={`size-3.5 shrink-0 ${cardsOpen ? "rotate-180" : ""}`}
            />
          </button>
        ) : (
          <p className="col-start-2 col-span-2 text-xs text-muted-foreground">
            {countText}
          </p>
        )}
      </div>
      {count > 0 && (
        <div id={cardsId} hidden={!cardsOpen}>
          <RequestList
            requests={requests}
            now={now}
            onMakeOffer={onMakeOffer}
          />
        </div>
      )}
    </fieldset>
  );
}
