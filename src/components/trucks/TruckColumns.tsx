import type { DataTableColumn } from "@/components/PaginatedTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { TruckStatusBadge } from "./TruckStatusBadge";
import type { CrewMember, CrewRole } from "@/lib/crewData";
import type { FleetTruck } from "@/lib/truckData";

type AssignmentHandler = (
  plate: string,
  role: CrewRole,
  personId: string,
) => void;

type TruckColumnOptions = {
  crew: CrewMember[];
  onView: (truck: FleetTruck) => void;
  onAssign: AssignmentHandler;
};

type CrewAssignmentProps = {
  truck: FleetTruck;
  crew: CrewMember[];
  role: CrewRole;
  onAssign: AssignmentHandler;
};

export function CrewAssignment({
  truck,
  crew,
  role,
  onAssign,
}: Readonly<CrewAssignmentProps>) {
  const value = role === "Driver" ? truck.driverId : truck.helperId;
  const hasAssignedPerson = crew.some((item) => item.id === value);
  const options = [
    { value: "", label: `No ${role.toLowerCase()}` },
    ...crew
      .filter((item) => item.role === role)
      .map((item) => ({
        value: item.id,
        label: `${item.name}${item.status === "Off duty" ? " (off duty)" : ""}`,
      })),
  ];

  return (
    <div className="space-y-1">
      <Select
        value={value}
        items={options}
        onValueChange={(next) => {
          if (next !== null) onAssign(truck.plate, role, next);
        }}
      >
        <SelectTrigger
          aria-label={`${role} for ${truck.plate}`}
          className="w-full min-w-36"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {role === "Driver" && !hasAssignedPerson && (
        <p className="text-xs text-yellow-700 dark:text-primary">
          Needs a driver
        </p>
      )}
    </div>
  );
}

function vehicleCell(truck: FleetTruck) {
  return (
    <div className="space-y-1">
      <Badge variant="outline" className="rounded-sm font-mono">
        {truck.plate}
      </Badge>
      <p className="text-xs text-muted-foreground">{truck.type}</p>
    </div>
  );
}

export function createTruckColumns({
  crew,
  onView,
}: TruckColumnOptions): DataTableColumn<FleetTruck>[] {
  return [
    { id: "vehicle", header: "Vehicle", cell: vehicleCell },
    {
      id: "model",
      header: "Model",
      className: "max-w-40 whitespace-normal",
      cell: (truck) => truck.model,
    },
    {
      id: "status",
      header: "Status",
      cell: (truck) => <TruckStatusBadge status={truck.status} />,
    },
    {
      id: "driver",
      header: "Driver",
      cell: (truck) =>
        crew.find((person) => person.id === truck.driverId)?.name ??
        "No driver",
    },
    {
      id: "details",
      header: "Details",
      className: "text-right",
      cell: (truck) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(truck)}
          aria-label={`View details for ${truck.plate}`}
        >
          View
        </Button>
      ),
    },
  ];
}
export function createAssignmentColumns({
  crew,
  onAssign,
}: Pick<
  TruckColumnOptions,
  "crew" | "onAssign"
>): DataTableColumn<FleetTruck>[] {
  return [
    { id: "vehicle", header: "Vehicle", cell: vehicleCell },
    {
      id: "status",
      header: "Status",
      cell: (truck) => <TruckStatusBadge status={truck.status} />,
    },
    {
      id: "driver",
      header: "Driver",
      cell: (truck) => (
        <CrewAssignment
          truck={truck}
          crew={crew}
          role="Driver"
          onAssign={onAssign}
        />
      ),
    },
    {
      id: "helper",
      header: "Helper",
      cell: (truck) => (
        <CrewAssignment
          truck={truck}
          crew={crew}
          role="Helper"
          onAssign={onAssign}
        />
      ),
    },
    {
      id: "trips",
      header: "Upcoming trips",
      className: "text-right",
      cell: (truck) => truck.upcomingTrips,
    },
  ];
}
