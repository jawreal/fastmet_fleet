"use client";

import { useState } from "react";
import Link from "next/link";
import { RouteStop } from "@/components/bookings/BookingCard";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { FleetTruck } from "@/lib/truckData";
import { getNumberCoding, type TruckProfile } from "@/lib/truckDetailsData";
import { DetailGrid } from "./DetailsLayout";

const operationalStates = ["Active", "In maintenance", "Inactive"] as const;
type OperationalState = (typeof operationalStates)[number];

type TruckOverviewProps = { truck: FleetTruck; profile: TruckProfile };

export function TruckOverview({
  truck,
  profile,
}: Readonly<TruckOverviewProps>) {
  /*TAKE_NOTE: MOCK UP */
  const [operationalState, setOperationalState] = useState<OperationalState>(
    truck.status === "In maintenance" ? "In maintenance" : "Active",
  );
  return (
    <section className="space-y-4 p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xs font-medium">Vehicle availability</h3>
          <p className="text-xs text-muted-foreground">
            Set whether this truck can receive bookings.
          </p>
        </div>
        <Select
          value={operationalState}
          items={operationalStates.map((value) => ({
            value,
            label: value,
          }))}
          onValueChange={(value) => {
            if (value && operationalStates.includes(value as OperationalState))
              setOperationalState(value as OperationalState);
          }}
        >
          <SelectTrigger
            aria-label="Vehicle availability"
            className="min-w-32 shrink-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {operationalStates.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {profile.booking && (
        <div className="space-y-2 rounded-md border bg-muted/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-medium">Current trip</h3>
            <Link
              href="/operations/bookings"
              className="text-xs font-medium underline underline-offset-4"
            >
              Open booking ↗
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">{profile.booking.id}</p>
          <div className="space-y-4 pt-1">
            {profile.booking.route.split("→").map((stop, index) => (
              <RouteStop
                key={`${index}-${stop}`}
                name={stop.trim()}
                area=""
                destination={index > 0}
              />
            ))}
          </div>
        </div>
      )}
      <h3 className="text-xs font-semibold">Vehicle specifications</h3>
      <DetailGrid
        items={[
          {
            label: "Capacity",
            value: profile.capacity
              ? `${profile.capacity.toLocaleString("en-PH")} kg`
              : "—",
          },
          {
            label: "Odometer",
            value: `${truck.odometer.toLocaleString("en-PH")} km`,
          },
          { label: "Number coding", value: getNumberCoding(truck.plate) },
          { label: "Chassis no.", value: profile.chassis },
          { label: "Engine no.", value: profile.engine },
        ]}
      />
    </section>
  );
}
