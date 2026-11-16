"use client";

import type { TruckTrip } from "@/lib/truckDetailsData";
import { formatMaintenancePesos } from "@/lib/maintenanceData";
import { SheetSection } from "./DetailsLayout";

type TruckRecentTripsProps = { trips: TruckTrip[] };

export function TruckRecentTrips({ trips }: Readonly<TruckRecentTripsProps>) {
  return (
    <SheetSection title="Recent trips">
      {trips.length ? (
        <ul className="divide-y">
          {trips.map((trip) => (
            <li
              key={`${trip.date}-${trip.route}`}
              className="flex items-center justify-between gap-4 py-3 first:pt-0"
            >
              <div>
                <p className="text-xs">{trip.route}</p>
                <p className="text-xs text-muted-foreground">
                  {trip.date} · {trip.driver}
                </p>
              </div>
              <span className="shrink-0 text-xs font-medium tabular-nums">
                {formatMaintenancePesos(trip.fare)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          No recent trips in this sample.
        </p>
      )}
    </SheetSection>
  );
}
