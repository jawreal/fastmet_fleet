"use client";

import { CircleIcon, ClockIcon, MapPinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RequestSummary } from "@/lib/requestTypes";

// Format fares as Philippine pesos and show pickup times in the dispatcher's timezone.
const pesos = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

const pickupFormat = new Intl.DateTimeFormat("en-PH", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Manila",
});

interface RequestCardProps {
  request: RequestSummary;
  now: number | null;
  onMakeOffer: (request: RequestSummary) => void;
}

export function timeLeft(
  request: RequestSummary,
  now: number | null,
  compact = false,
) {
  // Use stable copy until the client clock is ready, then round up to the next minute.
  if (now === null) return compact ? "Time pending" : "Time left loading";
  const minutes = Math.max(
    0,
    Math.ceil((Date.parse(request.expiresAt) - now) / 60_000),
  );
  if (minutes === 0) return "Expired";
  const time = minutes === 1 ? "" : "s";

  // Keep the rail's spoken label in full while the compact card uses the shorter unit.
  const unit = compact ? "min" : `minute${time}`;
  return `${minutes} ${unit} left`;
}

export function RequestCard({
  request,
  now,
  onMakeOffer,
}: Readonly<RequestCardProps>) {
  // The clock only controls urgency styling and the existing expired-offer behavior.
  const remaining = now === null ? null : Date.parse(request.expiresAt) - now;
  const expired = remaining !== null && remaining <= 0;
  const urgent = remaining !== null && remaining > 0 && remaining < 10 * 60_000;

  return (
    <article
      data-request-id={request.id}
      className="requests-card flex min-h-35 min-w-0 flex-col gap-1.5 rounded-lg border border-border bg-background text-xs"
    >
      {/* Keep the reference and fare on the line that receives the vehicle's connector. */}
      <div className="requests-card-heading flex min-w-0 items-center justify-between gap-2">
        <span
          className="truncate text-[10px] font-medium tabular-nums text-muted-foreground"
          title={request.bookingRef}
        >
          {request.bookingRef}
        </span>
        <span className="shrink-0 font-semibold tabular-nums">
          <span className="sr-only">Customer price: </span>
          {pesos.format(request.customerPrice)}
        </span>
      </div>

      {/* Space the stops so the dotted route is visible between the two icons. */}
      <div className="relative grid gap-6">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-2.5 bottom-2.5 left-1.5 border-l border-dotted border-primary/60"
        />
        <div className="flex min-w-0 items-center gap-1.5 leading-4">
          <CircleIcon
            aria-hidden="true"
            className="relative size-3.5 shrink-0 bg-background text-primary"
          />
          <span className="truncate font-medium" title={request.pickup}>
            <span className="sr-only">Pickup: </span>
            {request.pickup}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-1.5 leading-4">
          <MapPinIcon
            aria-hidden="true"
            className="relative size-3.5 shrink-0 bg-background text-primary"
          />
          <span className="truncate font-medium" title={request.dropoff}>
            <span className="sr-only">Drop-off: </span>
            {request.dropoff}
          </span>
        </div>
      </div>

      {/* Quiet trip metadata stays together on normal panels and wraps if the view narrows. */}
      <p className="flex flex-wrap items-center gap-x-2 text-[10px] leading-4 tabular-nums text-muted-foreground">
        {request.distanceKm !== undefined &&
          Number.isFinite(request.distanceKm) && (
            <>
              <span>{request.distanceKm.toFixed(1)} km</span>
              <span aria-hidden="true">·</span>
            </>
          )}
        <span>
          Pickup{" "}
          <time dateTime={request.pickupAt}>
            {pickupFormat.format(new Date(request.pickupAt))}
          </time>
        </span>
      </p>

      {/* Keep the clock at the leading edge and the two actions together at the trailing edge. */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-border pt-1.5">
        <span
          data-urgent={urgent}
          className={`inline-flex items-center gap-1 whitespace-nowrap text-[10px] tabular-nums ${urgent ? "font-bold text-primary-foreground dark:text-primary" : "text-muted-foreground"}`}
        >
          <ClockIcon aria-hidden="true" className="size-3 shrink-0" />
          {timeLeft(request, now, true)}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {/* Use a link-styled button while details has no navigation target. */}
          <Button
            type="button"
            variant="link"
            size="sm"
            className="px-0 text-[10px] text-muted-foreground underline hover:text-foreground"
          >
            View details
          </Button>
          <Button
            size="sm"
            className="text-[11px]"
            disabled={expired}
            onClick={() => onMakeOffer(request)}
          >
            Make offer
          </Button>
        </div>
      </div>
    </article>
  );
}
