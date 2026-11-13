"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CompletedService } from "@/lib/maintenanceData";
import { SheetSection } from "./DetailsLayout";

type TruckMaintenanceSectionProps = {
  nextPms: number;
  remaining: number;
  interval: number;
  usage: number;
  lastPms: CompletedService | undefined;
};

export function TruckMaintenanceSection({
  nextPms,
  remaining,
  interval,
  usage,
  lastPms,
}: Readonly<TruckMaintenanceSectionProps>) {
  return (
    <SheetSection title="Preventive maintenance">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span>
          {lastPms
            ? `Last PMS at ${lastPms.odometer.toLocaleString("en-PH")} km`
            : "Last PMS not recorded"}
        </span>
        <strong>
          {Math.abs(remaining).toLocaleString("en-PH")} km{" "}
          {remaining < 0 ? "overdue" : "to next PMS"}
        </strong>
      </div>
      <meter
        className="sr-only"
        min={0}
        max={100}
        value={usage}
        aria-label="PMS interval used"
      >
        {Math.round(usage)}%
      </meter>
      <div
        aria-hidden="true"
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${usage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Every {interval.toLocaleString("en-PH")} km · next at{" "}
        {nextPms.toLocaleString("en-PH")} km
      </p>
      <Button
        variant="outline"
        size="lg"
        render={<Link href="/fleet/maintenance" />}
        className="px-3"
        nativeButton={false}
      >
        Schedule service
      </Button>
    </SheetSection>
  );
}
