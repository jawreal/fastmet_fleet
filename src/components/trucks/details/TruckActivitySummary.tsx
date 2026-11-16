"use client";

import { formatMaintenancePesos } from "@/lib/maintenanceData";
import { SheetSection, DetailGrid } from "./DetailsLayout";

type TruckActivitySummaryProps = {
  metrics: {
    trips: number;
    earnings: number;
    fuelSpend: number;
    economy: number | null;
  };
};

export function TruckActivitySummary({
  metrics,
}: Readonly<TruckActivitySummaryProps>) {
  return (
    <SheetSection title="Last 30 days">
      <DetailGrid
        className="sm:grid-cols-4"
        items={[
          { label: "Trips", value: String(metrics.trips) },
          {
            label: "Earnings",
            value: formatMaintenancePesos(metrics.earnings),
          },
          {
            label: "Fuel spend",
            value: formatMaintenancePesos(metrics.fuelSpend),
          },
          {
            label: "Fuel economy",
            value: metrics.economy ? `${metrics.economy.toFixed(1)} km/L` : "—",
          },
        ]}
      />
    </SheetSection>
  );
}
