"use client";

import { useState } from "react";
import { DownloadIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TruckPerformanceReport } from "@/components/reports/TruckPerformanceReport";
import { DriverHelperReport } from "@/components/reports/DriverHelperReport";

type ReportPeriod =
  | "Last 7 days"
  | "Last 30 days"
  | "This month"
  | "Last month";

interface ReportMetric {
  title: string;
  value: string;
  description: string;
}

const reportPeriods: ReportPeriod[] = [
  "Last 7 days",
  "Last 30 days",
  "This month",
  "Last month",
];

/*TAKE_NOTE: MOCK UP */
const sampleMetrics: ReportMetric[] = [
  { title: "Completed trips", value: "10", description: "231 km loaded" },
  {
    title: "Fares earned",
    value: "₱73,070",
    description: "Last month, all yours",
  },
  {
    title: "Subscriptions paid",
    value: "₱1,400",
    description: "Vehicle slots. No commission on trips.",
  },
  {
    title: "Fuel and maintenance",
    value: "₱44,205",
    description: "₱2,205 fuel · ₱42,000 service",
  },
];

function ReportsSummary() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @min-[52rem]:grid-cols-4">
        {sampleMetrics.map(({ title, value, description }) => (
          <Card key={title}>
            <CardContent className="space-y-1">
              <h2 className="text-xs text-muted-foreground">{title}</h2>
              <p className="text-2xl font-semibold tracking-tight tabular-nums">
                {value}
              </p>
              <p className="text-xs/relaxed text-muted-foreground">
                {description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-primary/5 ring-primary/30">
        <CardContent className="space-y-1">
          <h2 className="text-xs text-muted-foreground">Contribution</h2>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            ₱27,465
          </p>
          <p className="text-xs/relaxed text-muted-foreground">
            Fares minus subscription, fuel, and service
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function ReportsDashboard() {
  /*TAKE_NOTE: MOCK UP */
  // Period selection is UI-only until reports are connected to live data.
  const [selectedPeriod, setSelectedPeriod] =
    useState<ReportPeriod>("Last month");

  return (
    <div className="@container mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Performance by truck and driver.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" /> Synced
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <fieldset
          className="m-0 min-w-0 max-w-full border-0 p-0"
        >
          <legend className="sr-only">Report period</legend>
          <div className="flex max-w-full overflow-x-auto border-b border-border">
            {reportPeriods.map((period) => (
              <Button
                key={period}
                type="button"
                variant="ghost"
                aria-pressed={selectedPeriod === period}
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  "h-8 rounded-none rounded-t-md border-0 border-b-2 border-transparent px-3 text-muted-foreground active:not-aria-[haspopup]:translate-y-0",
                  selectedPeriod === period &&
                    "border-primary bg-primary/10 text-yellow-600 hover:bg-primary/15 hover:text-primary",
                )}
              >
                {period}
              </Button>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline">
            <DownloadIcon data-icon="inline-start" />
            Bookings CSV
          </Button>
          <Button type="button" variant="outline">
            <DownloadIcon data-icon="inline-start" />
            Truck summary CSV
          </Button>
        </div>
      </div>

      <ReportsSummary />
      <TruckPerformanceReport />
      <DriverHelperReport />
    </div>
  );
}
