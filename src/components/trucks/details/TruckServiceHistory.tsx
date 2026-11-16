"use client";

import { Badge } from "@/components/ui/badge";
import {
  formatMaintenanceDate,
  formatMaintenancePesos,
  type ScheduledService,
  type CompletedService,
} from "@/lib/maintenanceData";
import { SheetSection } from "./DetailsLayout";

type TruckServiceHistoryProps = {
  scheduled: ScheduledService[];
  history: CompletedService[];
};

export function TruckServiceHistory({
  scheduled,
  history,
}: Readonly<TruckServiceHistoryProps>) {
  return (
    <SheetSection title="Service history">
      <ul className="divide-y">
        {scheduled.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between gap-4 py-3 first:pt-0"
          >
            <div>
              <p className="text-xs">{entry.kind}</p>
              <p className="text-xs text-muted-foreground">
                {entry.dueDate
                  ? `Due ${formatMaintenanceDate(entry.dueDate)}`
                  : `At ${entry.dueKm?.toLocaleString("en-PH")} km`}
              </p>
            </div>
            <Badge variant="outline">Scheduled</Badge>
          </li>
        ))}
        {history.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between gap-4 py-3"
          >
            <div>
              <p className="text-xs">{entry.kind}</p>
              <p className="text-xs text-muted-foreground">
                {formatMaintenanceDate(entry.date)} ·{" "}
                {entry.odometer.toLocaleString("en-PH")} km
              </p>
            </div>
            <span className="text-xs font-medium tabular-nums">
              {formatMaintenancePesos(entry.cost)}
            </span>
          </li>
        ))}
      </ul>
      {!scheduled.length && !history.length && (
        <p className="text-xs text-muted-foreground">
          No service history in this sample.
        </p>
      )}
    </SheetSection>
  );
}
