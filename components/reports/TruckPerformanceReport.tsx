"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PaginatedTable,
  type DataTableColumn,
} from "@/components/PaginatedTable";
import { cn } from "@/lib/utils";
import {
  formatPesos,
  truckReports,
  type TruckReportData,
} from "@/lib/reportData";

const getContribution = (truck: TruckReportData): number =>
  truck.fares - truck.subscription - truck.fuel - truck.service;
const largestContribution = Math.max(
  1,
  ...truckReports.map((truck) => Math.abs(getContribution(truck))),
);
const sum = (key: "trips" | "fares" | "subscription" | "fuel" | "service") =>
  truckReports.reduce((total, truck) => total + truck[key], 0);

const columns: DataTableColumn<TruckReportData>[] = [
  {
    id: "truck",
    header: "Truck",
    footer: "Total",
    cell: (truck) => (
      <>
        <Badge variant="outline" className="rounded-sm font-mono">
          {truck.plate}
        </Badge>
        <span className="ml-2 text-muted-foreground">{truck.type}</span>
      </>
    ),
  },
  {
    id: "trips",
    header: "Trips",
    cell: (truck) => truck.trips,
    footer: sum("trips"),
    className: "text-right",
  },
  {
    id: "utilization",
    header: "Utilization",
    cell: (truck) => `${truck.utilization}%`,
    footer: "—",
    className: "text-right",
  },
  ...(["fares", "subscription", "fuel", "service"] as const).map((key) => ({
    id: key,
    header: key.charAt(0).toUpperCase() + key.slice(1),
    className: "text-right",
    cell: (truck: TruckReportData) => (
      <span className={cn(truck[key] === 0 && "text-muted-foreground")}>
        {formatPesos(truck[key])}
      </span>
    ),
    footer: formatPesos(sum(key)),
  })),
  {
    id: "contribution",
    header: "Contribution",
    className: "text-right",
    footer: (
      <div className="pr-27">
        {formatPesos(
          truckReports.reduce(
            (total, truck) => total + getContribution(truck),
            0,
          ),
        )}
      </div>
    ),
    cell: (truck) => {
      const contribution = getContribution(truck);
      return (
        <div className="flex items-center justify-end gap-3">
          <span
            className={cn(
              "font-medium",
              contribution < 0 && "text-destructive",
            )}
          >
            {formatPesos(contribution)}
          </span>
          <div
            className="h-1.5 w-24 overflow-hidden rounded-full bg-muted"
            aria-hidden="true"
          >
            <div
              className={cn(
                "h-full rounded-full",
                contribution < 0 ? "bg-destructive" : "bg-primary",
              )}
              style={{
                width: `${(Math.abs(contribution) / largestContribution) * 100}%`,
              }}
            />
          </div>
        </div>
      );
    },
  },
];

export function TruckPerformanceReport() {
  return (
    <Card className="min-w-0 gap-0 pb-0" aria-labelledby="truckReportHeading">
      <CardHeader className="flex flex-wrap items-center justify-between gap-2 border-b">
        <CardTitle id="truckReportHeading">By truck</CardTitle>
        <p className="text-xs text-muted-foreground">
          Oct 1, 2026 – Oct 31, 2026
        </p>
      </CardHeader>
      <PaginatedTable
        data={truckReports}
        columns={columns}
        getRowId={(truck) => truck.plate}
        labelledBy="truckReportHeading"
        className="min-w-212.5"
      />
    </Card>
  );
}
