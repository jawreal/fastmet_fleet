"use client";

import { ArrowDownIcon, ClockIcon, TruckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RequestSummary } from "@/lib/requestFixtures";

// Explicit locale/timezone make pickup formatting consistent with the Philippine client app.
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

interface IRequestDetails {
  request: RequestSummary;
  now: number | null;
  onMakeOffer: (request: RequestSummary) => void;
}

export function timeLeft(request: RequestSummary, now: number | null) {
  // Neutral server copy avoids a mismatch between the server clock and hydration time.
  if (now === null) return "Time left loading";
  const minutes = Math.max(
    0,
    Math.ceil((Date.parse(request.expiresAt) - now) / 60_000),
  );

  const time = minutes === 1 ? "" : "s";
  return minutes ? `${minutes} minute${time} left` : "Expired";
}

export function RequestDetails({
  request,
  now,
  onMakeOffer,
}: Readonly<IRequestDetails>) {
  const expired = now !== null && Date.parse(request.expiresAt) <= now;
  return (
    <div className="flex min-w-0 flex-col gap-3 text-xs">
      {/* Vehicle identity is useful to dispatchers; customer identity is intentionally absent. */}
      <div className="flex items-start gap-2">
        <TruckIcon
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-primary"
        />
        <h3 className="font-medium text-sm wrap-anywhere">
          {request.vehicleName}
        </h3>
      </div>
      {/* A route spine communicates pickup then drop-off without adding decorative labels. */}
      <div className="flex gap-2">
        <ArrowDownIcon
          aria-hidden="true"
          className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
        />
        <div className="space-y-1 wrap-anywhere">
          <p>{request.pickup}</p>
          <p className="text-muted-foreground">{request.dropoff}</p>
        </div>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
        <dt className="text-muted-foreground">Pickup</dt>
        <dd className="text-right">
          <time dateTime={request.pickupAt}>
            {pickupFormat.format(new Date(request.pickupAt))}
          </time>
        </dd>
        <dt className="text-muted-foreground">Distance</dt>
        <dd className="text-right tabular-nums">
          {request.distanceKm.toFixed(1)} km
        </dd>
        <dt className="text-muted-foreground">Customer price</dt>
        <dd className="text-right text-sm font-semibold tabular-nums">
          {pesos.format(request.customerPrice)}
        </dd>
      </dl>
      {/* Urgency always includes words, so it remains clear without color perception. */}
      <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <ClockIcon aria-hidden="true" className="size-3" />
          {timeLeft(request, now)}
        </span>
        <Button
          size="sm"
          disabled={expired}
          onClick={() => onMakeOffer(request)}
        >
          Make offer
        </Button>
      </div>
    </div>
  );
}
