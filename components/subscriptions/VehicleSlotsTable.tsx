"use client";

import { useMemo, useState } from "react";
import { PaginatedTable } from "@/components/PaginatedTable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FleetVehicleFiles } from "@/lib/VehicleFileData";
import { vehicleSlots } from "../../lib/SubscriptionData";
import {
  createVehicleSlotColumns,
  type SlotAction,
} from "./VehicleSlotColumns";
import { RenewSubscriptionDialog } from "./RenewSubscriptionDialog";
import { ReleaseSlotDialog } from "./ReleaseSlotDialog";
import { SlotRequirementsDialog } from "./SlotRequirementsDialog";

export function VehicleSlotsTable() {
  const [selectedAction, setSelectedAction] = useState<SlotAction>(null);
  // Keep files per vehicle above the dialog so closing/reopening does not lose them.
  const [vehicleFiles, setVehicleFiles] = useState<FleetVehicleFiles>({});
  const dueSlots = vehicleSlots.filter((slot) => slot.status === "Expired");

  // Only the action callback is dynamic; all cell components live at module scope.
  const columns = useMemo(
    () => createVehicleSlotColumns(setSelectedAction),
    [setSelectedAction],
  );

  return (
    <Card className="min-w-0 gap-0 pb-0" aria-labelledby="vehicleSlotsHeading">
      <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b">
        <div className="space-y-1">
          <CardTitle id="vehicleSlotsHeading">Vehicle slots</CardTitle>
          <CardDescription>
            {vehicleSlots.filter((slot) => slot.status === "Active").length} of{" "}
            {vehicleSlots.length} active
          </CardDescription>
        </div>
        <Button
          type="button"
          disabled={dueSlots.length === 0}
          onClick={() => setSelectedAction({ type: "renew", slots: dueSlots })}
        >
          Renew {dueSlots.length} due
        </Button>
      </CardHeader>
      <PaginatedTable
        data={vehicleSlots}
        columns={columns}
        getRowId={(slot) => slot.plate}
        labelledBy="vehicleSlotsHeading"
        className="min-w-195"
      />
      {selectedAction?.type === "renew" && (
        <RenewSubscriptionDialog
          slots={selectedAction.slots}
          onClose={() => setSelectedAction(null)}
        />
      )}
      {selectedAction?.type === "release" && (
        <ReleaseSlotDialog
          slot={selectedAction.slot}
          onClose={() => setSelectedAction(null)}
        />
      )}
      {selectedAction?.type === "requirements" && (
        <SlotRequirementsDialog
          slot={selectedAction.slot}
          files={vehicleFiles[selectedAction.slot.plate] ?? {}}
          onFileChange={(documentId, file) => {
            const plate = selectedAction.slot.plate;
            setVehicleFiles((current) => ({
              ...current,
              [plate]: { ...current[plate], [documentId]: file },
            }));
          }}
          onClose={() => setSelectedAction(null)}
        />
      )}
    </Card>
  );
}
