import type { DataTableColumn } from "@/components/PaginatedTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ellipsis, Check, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  formatMaintenanceDate,
  formatMaintenancePesos,
  getServiceStatus,
  maintenanceToday,
  type MaintenanceTruck,
  type ScheduledService,
  type CompletedService,
} from "@/lib/maintenanceData";

type ServiceDueProps = { service: ScheduledService; truck: MaintenanceTruck };

function ServiceDue({ service, truck }: Readonly<ServiceDueProps>) {
  const status = getServiceStatus(service, truck);
  const days = service.dueDate
    ? Math.round(
        (Date.parse(service.dueDate) - Date.parse(maintenanceToday)) / 86400000,
      )
    : null;
  const isOverdue = days && days < 0 ? "overdue" : "left";

  return (
    <div className="space-y-1">
      <Badge
        variant="outline"
        className={cn(
          "font-normal",
          status === "Overdue" &&
            "border-destructive/30 bg-destructive/10 text-destructive",
          status === "Due soon" &&
            "border-primary/30 bg-primary/10 text-yellow-700 dark:text-primary",
        )}
      >
        {status}
      </Badge>
      {days !== null && (
        <p className="text-xs text-muted-foreground">
          {days === 0
            ? "Due today"
            : `Due ${formatMaintenanceDate(service.dueDate)} (${Math.abs(days)} d ${isOverdue})`}
        </p>
      )}
      {service.dueKm !== null && (
        <p className="text-xs text-muted-foreground">
          {(service.dueKm - truck.odometer).toLocaleString("en-PH")} km left (at{" "}
          {service.dueKm.toLocaleString("en-PH")} km)
        </p>
      )}
    </div>
  );
}
type ServiceColumnOptions = {
  trucks: MaintenanceTruck[];
  onComplete: (service: ScheduledService) => void;
  onEdit: (service: ScheduledService) => void;
};

type ServiceActionsProps = Pick<
  ServiceColumnOptions,
  "onComplete" | "onEdit"
> & {
  service: ScheduledService;
};

function ServiceActions({
  service,
  onComplete,
  onEdit,
}: Readonly<ServiceActionsProps>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${service.kind} on ${service.plate}`}
          />
        }
      >
        <Ellipsis />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onComplete(service)}>
            <Check aria-hidden="true" />
            Mark done
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(service)}>
            <Pencil aria-hidden="true" />
            Edit
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export function createServiceColumns({
  trucks,
  onComplete,
  onEdit,
}: ServiceColumnOptions): DataTableColumn<ScheduledService>[] {
  return [
    {
      id: "truck",
      header: "Truck",
      cell: (row) => (
        <Badge
          variant="outline"
          className="rounded-sm whitespace-nowrap font-mono"
        >
          {row.plate}
        </Badge>
      ),
    },
    {
      id: "service",
      header: "Service",
      className: "min-w-32 max-w-48 whitespace-normal",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.kind}</p>
          <p className="text-xs text-muted-foreground">{row.notes}</p>
        </div>
      ),
    },
    {
      id: "when",
      header: "When",
      className: "min-w-36 whitespace-normal",
      cell: (row) => (
        <ServiceDue
          service={row}
          truck={trucks.find((truck) => truck.plate === row.plate)!}
        />
      ),
    },
    {
      id: "cost",
      header: "Est. cost",
      className: "text-right whitespace-nowrap",
      cell: (row) => formatMaintenancePesos(row.cost),
    },
    {
      id: "shop",
      header: "Shop",
      className: "min-w-28 max-w-36 whitespace-normal text-muted-foreground",
      cell: (row) => row.shop || "—",
    },
    {
      id: "actions",
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <ServiceActions service={row} onComplete={onComplete} onEdit={onEdit} />
      ),
    },
  ];
}
export const historyColumns: DataTableColumn<CompletedService>[] = [
  {
    id: "date",
    header: "Date",
    className: "whitespace-nowrap",
    cell: (row) => formatMaintenanceDate(row.date),
  },
  {
    id: "truck",
    header: "Truck",
    cell: (row) => (
      <Badge variant="outline" className="rounded-sm font-mono">
        {row.plate}
      </Badge>
    ),
  },
  {
    id: "service",
    header: "Service",
    cell: (row) => (
      <div>
        <p className="font-medium">{row.kind}</p>
        <p className="text-xs text-muted-foreground">{row.shop || "—"}</p>
        {row.notes && (
          <p className="text-xs text-muted-foreground">{row.notes}</p>
        )}
      </div>
    ),
  },
  {
    id: "odometer",
    header: "Odometer",
    className: "text-right",
    cell: (row) => row.odometer.toLocaleString("en-PH"),
  },
  {
    id: "cost",
    header: "Cost",
    className: "text-right",
    cell: (row) => formatMaintenancePesos(row.cost),
  },
];
