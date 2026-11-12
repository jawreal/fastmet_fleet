"use client";

import {
  EllipsisIcon,
  FileCheckIcon,
  LogOutIcon,
  RefreshCwIcon,
} from "lucide-react";
import type { DataTableColumn } from "@/components/PaginatedTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPesos } from "@/lib/reportData";
import { cn } from "@/lib/utils";
import {
  formatRenewalDate,
  type VehicleSlot,
} from "../../lib/pubscriptionData";

export type SlotAction =
  | { type: "renew"; slots: VehicleSlot[] }
  | { type: "release"; slot: VehicleSlot }
  | { type: "requirements"; slot: VehicleSlot }
  | null;

type SlotActionHandler = (action: SlotAction) => void;

interface VehicleSlotCellProps {
  slot: VehicleSlot;
}

interface VehicleSlotActionsProps extends VehicleSlotCellProps {
  onAction: SlotActionHandler;
}

const statusDotClasses: Record<VehicleSlot["status"], string> = {
  Active: "bg-emerald-500",
  Expired: "bg-destructive",
  "No slot": "bg-muted-foreground",
};

function VehicleSlotIdentity({ slot }: Readonly<VehicleSlotCellProps>) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="rounded-sm font-mono">
        {slot.plate}
      </Badge>
      <span className="text-muted-foreground">{slot.vehicleType}</span>
      {slot.status === "No slot" && (
        <Badge
          variant="secondary"
          className="gap-1.5 text-blue-600 dark:text-blue-400"
        >
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-current"
          />{" "}
          Waiting for approval
        </Badge>
      )}
    </div>
  );
}

function VehicleSlotRenewal({ slot }: Readonly<VehicleSlotCellProps>) {
  if (slot.status === "No slot") {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <span className={cn(slot.status === "Expired" && "text-muted-foreground")}>
      {slot.status === "Expired" && "Expired · "}
      {formatRenewalDate(slot.renewalDate)}
    </span>
  );
}

function VehicleSlotStatus({ slot }: Readonly<VehicleSlotCellProps>) {
  const dotClassName = statusDotClasses[slot.status];

  return (
    <Badge variant="outline" className="gap-1.5">
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", dotClassName)}
      />
      {slot.status}
    </Badge>
  );
}

function VehicleSlotActions({
  slot,
  onAction,
}: Readonly<VehicleSlotActionsProps>) {
  const hasSlot = slot.status !== "No slot";

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Actions for ${slot.plate}`}
            />
          }
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem
            disabled={!hasSlot}
            onClick={() => onAction({ type: "renew", slots: [slot] })}
          >
            <RefreshCwIcon aria-hidden="true" />
            Renew subscription
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={!hasSlot}
            onClick={() => onAction({ type: "release", slot })}
          >
            <LogOutIcon aria-hidden="true" />
            Release slot
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={hasSlot}
            onClick={() => onAction({ type: "requirements", slot })}
          >
            <FileCheckIcon aria-hidden="true" />
            Requirements
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Cell components are defined at module scope, keeping their identity stable on rerenders.
const vehicleSlotColumns: DataTableColumn<VehicleSlot>[] = [
  {
    id: "vehicle",
    header: "Vehicle",
    cell: (slot) => <VehicleSlotIdentity slot={slot} />,
  },
  { id: "plan", header: "Plan", cell: (slot) => slot.plan },
  {
    id: "monthly",
    header: "Monthly",
    className: "text-right",
    cell: (slot) => formatPesos(slot.monthlyPrice),
  },
  {
    id: "deposit",
    header: "Deposit",
    className: "text-right",
    cell: (slot) =>
      slot.deposit === null ? "Not paid" : formatPesos(slot.deposit),
  },
  {
    id: "renews",
    header: "Renews",
    cell: (slot) => <VehicleSlotRenewal slot={slot} />,
  },
  {
    id: "status",
    header: "Status",
    cell: (slot) => <VehicleSlotStatus slot={slot} />,
  },
];

export function createVehicleSlotColumns(
  onAction: SlotActionHandler,
): DataTableColumn<VehicleSlot>[] {
  return [
    ...vehicleSlotColumns,
    {
      id: "actions",
      header: "Actions",
      className: "text-right",
      cell: (slot) => <VehicleSlotActions slot={slot} onAction={onAction} />,
    },
  ];
}
