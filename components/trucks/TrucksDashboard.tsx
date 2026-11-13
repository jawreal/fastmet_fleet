"use client";

import { useCallback, useMemo, useState } from "react";
import { AddVehicleSheet } from "./add/AddVehicleSheet";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PaginatedTable } from "@/components/PaginatedTable";
import { TableSearch } from "@/components/TableSearch";
import { cn } from "@/lib/utils";
import { filterTableRows } from "@/lib/tableSearch";
import { sampleCrew, type CrewRole } from "@/lib/crewData";
import { sampleTrucks, truckFilters, type TruckFilter } from "@/lib/truckData";
import { createTruckColumns, createAssignmentColumns } from "./TruckColumns";
import { TruckDetailsSheet } from "./TruckDetailsSheet";

const views = ["Vehicles", "Driver assignments"] as const;
type TruckView = (typeof views)[number];

export function TrucksDashboard() {
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [view, setView] = useState<TruckView>("Vehicles");
  const [filter, setFilter] = useState<TruckFilter>("All statuses");
  const [query, setQuery] = useState("");
  const [selectedPlate, setSelectedPlate] = useState<string | null>(null);
  /*TAKE_NOTE: MOCK UP */
  const [trucks, setTrucks] = useState(sampleTrucks);
  /*TAKE_NOTE: MOCK UP */
  const assignCrew = useCallback(
    (plate: string, role: CrewRole, personId: string) => {
      const field = role === "Driver" ? "driverId" : "helperId";
      setTrucks((current) =>
        current.map((truck) => {
          if (truck.plate === plate) return { ...truck, [field]: personId };
          if (personId && truck[field] === personId)
            return { ...truck, [field]: "" };
          return truck;
        }),
      );
    },
    [],
  );
  const options = useMemo(
    () => ({
      crew: sampleCrew,
      onView: (truck: (typeof sampleTrucks)[number]) =>
        setSelectedPlate(truck.plate),
      onAssign: assignCrew,
    }),
    [assignCrew],
  );
  const vehicleColumns = useMemo(() => createTruckColumns(options), [options]);
  const assignmentColumns = useMemo(
    () => createAssignmentColumns(options),
    [options],
  );
  const statusRows = trucks.filter(
    (truck) =>
      filter === "All statuses" ||
      (filter === "Needs driver" ? !truck.driverId : truck.status === filter),
  );
  const rows = filterTableRows(statusRows, query, (truck) => [
    truck.plate,
    truck.model,
    truck.type,
    truck.status,
    sampleCrew.find((person) => person.id === truck.driverId)?.name,
    sampleCrew.find((person) => person.id === truck.helperId)?.name,
  ]);
  const selectedTruck = trucks.find((truck) => truck.plate === selectedPlate);
  const unassignedCount = trucks.filter((truck) => !truck.driverId).length;
  const relievers = sampleCrew
    .filter(
      (person) =>
        person.role === "Driver" &&
        !trucks.some((truck) => truck.driverId === person.id),
    )
    .map((person) => person.name);
  return (
    <div className="@container flex min-w-0 flex-col gap-5">
      {/* ------ Page header --------- */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Trucks</h1>
        <p className="text-sm text-muted-foreground">
          Vehicles, driver assignments, documents and PMS.
        </p>
      </header>
      {/* ------ Tinted view tabs --------- */}
      <fieldset className="m-0 min-w-0 max-w-full self-start border-0 p-0">
        <legend className="sr-only">Truck view</legend>
        <div className="flex max-w-full overflow-x-auto border-b border-border">
          {views.map((item) => (
            <Button
              key={item}
              variant="ghost"
              type="button"
              aria-pressed={view === item}
              aria-controls="truck-table"
              onClick={() => setView(item)}
              className={cn(
                "h-8 shrink-0 rounded-none rounded-t-md border-0 border-b-2 border-transparent px-3 text-muted-foreground active:not-aria-[haspopup]:translate-y-0",
                view === item &&
                  "border-primary bg-primary/10 text-yellow-600 hover:bg-primary/15 hover:text-primary",
              )}
            >
              {item}
              {item === "Driver assignments" && unassignedCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-4 min-w-4 rounded-sm px-1 tabular-nums"
                  aria-label={`${unassignedCount} vehicles need a driver`}
                >
                  {unassignedCount}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </fieldset>
      {/* ------ Searchable fleet table --------- */}
      <Card id="truck-table" className="min-w-0 gap-0 pb-0">
        <CardHeader className="flex flex-col items-center gap-3 pb-4 md:flex-row">
          <div className="w-full min-w-0 space-y-1 md:w-auto md:flex-1">
            <CardTitle id="truck-table-heading">
              {view === "Vehicles"
                ? "Fleet vehicles"
                : "Who drives each vehicle"}
            </CardTitle>
            <CardDescription>
              {trucks.length} vehicles ·{" "}
              {trucks.filter((truck) => truck.status === "Available").length}{" "}
              available
            </CardDescription>
          </div>
          <div className="grid w-full grid-cols-[1fr_auto] items-center gap-2 md:flex md:w-auto md:shrink-0">
            <Select
              value={filter}
              items={truckFilters.map((value) => ({ value, label: value }))}
              onValueChange={(value) => {
                if (value && truckFilters.includes(value as TruckFilter))
                  setFilter(value as TruckFilter);
              }}
            >
              <SelectTrigger
                className="min-w-32 w-full md:w-auto"
                aria-label="Filter trucks"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {truckFilters.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="col-span-2 row-start-2 min-w-0 [&>div]:max-w-none md:order-0 md:w-64">
              <TableSearch
                label="Search trucks"
                placeholder="Search plate, model or crew…"
                value={query}
                onValueChange={setQuery}
              />
            </div>
            {/*TAKE_NOTE: MOCK UP */}
            <Button
              type="button"
              className="col-start-2 row-start-1"
              onClick={() => {
                if (view === "Vehicles") setAddingVehicle(true);
              }}
            >
              <Plus />
              {view === "Vehicles" ? "Add vehicle" : "Add driver"}
            </Button>
          </div>
        </CardHeader>
        <PaginatedTable
          key={`${view}-${filter}-${query}`}
          data={rows}
          columns={view === "Vehicles" ? vehicleColumns : assignmentColumns}
          getRowId={(truck) => truck.plate}
          labelledBy="truck-table-heading"
        />
        {view === "Driver assignments" && (
          <CardFooter className="flex-col items-start gap-1 border-t py-3 text-muted-foreground">
            <p>
              Assignments update in this preview session only; refreshing resets
              them. Each crew member can be assigned to one vehicle at a time.
            </p>
            <p>
              Relievers without a vehicle: {relievers.join(", ") || "None"}.
            </p>
          </CardFooter>
        )}
      </Card>
      {addingVehicle && (
        <AddVehicleSheet onClose={() => setAddingVehicle(false)} />
      )}
      {/* ------ Full vehicle details sheet --------- */}
      {selectedTruck && (
        <TruckDetailsSheet
          truck={selectedTruck}
          crew={sampleCrew}
          onAssign={assignCrew}
          onClose={() => setSelectedPlate(null)}
        />
      )}
    </div>
  );
}
