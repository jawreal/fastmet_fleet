"use client";

import type { FleetTruck } from "@/lib/truckData";
import type { CrewMember, CrewRole } from "@/lib/crewData";
import { CrewAssignment } from "../TruckColumns";
import { SheetSection } from "./DetailsLayout";

type TruckCrewSectionProps = {
  truck: FleetTruck;
  crew: CrewMember[];
  onAssign: (plate: string, role: CrewRole, personId: string) => void;
};

export function TruckCrewSection({
  truck,
  crew,
  onAssign,
}: Readonly<TruckCrewSectionProps>) {
  const driver = crew.find((person) => person.id === truck.driverId);
  return (
    <SheetSection title="Crew">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-xs">Driver</p>
          <CrewAssignment
            truck={truck}
            crew={crew}
            role="Driver"
            onAssign={onAssign}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs">Helper</p>
          <CrewAssignment
            truck={truck}
            crew={crew}
            role="Helper"
            onAssign={onAssign}
          />
        </div>
      </div>
      <p className="text-xs/relaxed text-muted-foreground">
        {driver ? `${driver.name} · ${driver.phone}.` : "No driver assigned."}{" "}
        Crew changes apply to this preview session.
      </p>
    </SheetSection>
  );
}
