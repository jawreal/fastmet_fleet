"use client";

import { TableSearch } from "@/components/TableSearch";
import { filterTableRows } from "@/lib/tableSearch";

import { useMemo, useState } from "react";
import { PaginatedTable } from "@/components/PaginatedTable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FleetVehicleFiles } from "@/lib/vehicleFileData";
import { vehicleSlots } from "../../lib/pubscriptionData";
import {
  createVehicleSlotColumns,
  type SlotAction,
} from "./VehicleSlotColumns";
import { RenewSubscriptionDialog } from "./RenewSubscriptionDialog";
import { ReleaseSlotDialog } from "./ReleaseSlotDialog";
import { SlotRequirementsDialog } from "./SlotRequirementsDialog";

export function VehicleSlotsTable() {
  const [query, setQuery] = useState("");
  /*TAKE_NOTE: MOCK UP */
  const rows = filterTableRows(vehicleSlots, query, (slot) => [
    slot.plate,
    slot.vehicleType,
    slot.plan,
    slot.status,
  ]);
  const [selectedAction, setSelectedAction] = useState<SlotAction>(null);
  // Keep files per vehicle above the dialog so closing/reopening does not lose them.
  /*TAKE_NOTE: MOCK UP */
  const [vehicleFiles, setVehicleFiles] = useState<FleetVehicleFiles>({});
  const dueSlots = vehicleSlots.filter((slot) => slot.status === "Expired");

  // Only the action callback is dynamic; all cell components live at module scope.
  const columns = useMemo(
    () => createVehicleSlotColumns(setSelectedAction),
    [setSelectedAction],
  );

  return (
    <Card className="min-w-0 gap-0 pb-0" aria-labelledby="vehicleSlotsHeading">
      <CardHeader className="flex flex-col md:flex-row items-center gap-3 border-b">
        <div className="space-y-1 w-full">
          <CardTitle id="vehicleSlotsHeading">Vehicle slots</CardTitle>
          <CardDescription>
            {vehicleSlots.filter((slot) => slot.status === "Active").length} of{" "}
            {vehicleSlots.length} active
          </CardDescription>
        </div>
        <div className="flex w-full items-center justify-end gap-x-2">
          <TableSearch
            label="Search vehicle slots"
            placeholder="Search vehicle, plan or status…"
            value={query}
            onValueChange={setQuery}
          />
          <Button
            type="button"
            disabled={dueSlots.length === 0}
            onClick={() =>
              setSelectedAction({ type: "renew", slots: dueSlots })
            }
          >
            Renew {dueSlots.length} due
          </Button>
        </div>
      </CardHeader>
      <PaginatedTable
        key={query}
        data={rows}
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
