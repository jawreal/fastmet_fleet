"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TruckStatusBadge } from "./TruckStatusBadge";
import type { CrewMember, CrewRole } from "@/lib/crewData";
import type { FleetTruck } from "@/lib/truckData";
import { getTruckDetailsView } from "@/lib/truckDetailsView";
import { TruckOverview } from "./details/TruckOverview";
import { TruckCrewSection } from "./details/TruckCrewSection";
import { TruckActivitySummary } from "./details/TruckActivitySummary";
import { TruckDocumentsSection } from "./details/TruckDocumentsSection";
import { TruckMaintenanceSection } from "./details/TruckMaintenanceSection";
import { TruckServiceHistory } from "./details/TruckServiceHistory";
import { TruckRecentTrips } from "./details/TruckRecentTrips";

type TruckDetailsSheetProps = {
  truck: FleetTruck;
  crew: CrewMember[];
  onAssign: (plate: string, role: CrewRole, personId: string) => void;
  onClose: () => void;
};

export function TruckDetailsSheet({
  truck,
  crew,
  onAssign,
  onClose,
}: Readonly<TruckDetailsSheetProps>) {
  /*TAKE_NOTE: MOCK UP */
  const { profile, metrics, maintenance, scheduled, history } =
    getTruckDetailsView(truck);
  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg"
      >
        {/* ------ Fixed vehicle header --------- */}
        <SheetHeader className="shrink-0 border-b p-5 pr-12">
          <div className="flex items-center gap-3">
            <SheetTitle>
              <Badge
                variant="outline"
                className="rounded-sm px-2 py-1 font-mono text-base tracking-wider"
              >
                {truck.plate}
              </Badge>
            </SheetTitle>
            <TruckStatusBadge status={truck.status} />
          </div>
          <SheetDescription>
            {truck.model}
            {profile.year && ` · ${profile.year}`} · {truck.type}
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* ------ Vehicle status and specifications --------- */}
          <TruckOverview key={truck.plate} truck={truck} profile={profile} />
          {/* ------ Crew assignments --------- */}
          <TruckCrewSection truck={truck} crew={crew} onAssign={onAssign} />
          {/* ------ Last 30 days metrics --------- */}
          <TruckActivitySummary metrics={metrics} />
          {/* ------ Vehicle files, approval and documents --------- */}
          <TruckDocumentsSection
            approved={profile.approved}
            documents={profile.documents}
          />
          {/* ------ Preventive maintenance --------- */}
          <TruckMaintenanceSection {...maintenance} />
          {/* ------ Service history --------- */}
          <TruckServiceHistory scheduled={scheduled} history={history} />
          {/* ------ Recent trips --------- */}
          <TruckRecentTrips trips={profile.trips} />
        </div>
        {/* ------ Fixed vehicle actions (placeholders) --------- */}
        <SheetFooter className="shrink-0 flex-row justify-between border-t bg-muted/20 p-4">
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="px-3 text-destructive"
          >
            Delete truck
          </Button>
          <Button type="button" size="lg" className="px-3">
            Edit truck
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
