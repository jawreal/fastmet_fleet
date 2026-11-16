"use client";

import { TableSearch } from "@/components/TableSearch";
import { filterTableRows } from "@/lib/tableSearch";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PaginatedTable,
  type DataTableColumn,
} from "@/components/PaginatedTable";
import { formatPesos } from "@/lib/reportData";

export interface VehicleRate {
  type: string;
  plan: "Motorcycle" | "Sedan to L300" | "Truck";
  capacityKg: number;
  baseFare: number;
}

/*TAKE_NOTE: MOCK UP */
const vehicleRates: VehicleRate[] = [
  { type: "Motorcycle", plan: "Motorcycle", capacityKg: 20, baseFare: 80 },
  { type: "Sedan", plan: "Sedan to L300", capacityKg: 200, baseFare: 300 },
  {
    type: "L300 FB Van",
    plan: "Sedan to L300",
    capacityKg: 1000,
    baseFare: 1200,
  },
  { type: "4W Closed Van", plan: "Truck", capacityKg: 2500, baseFare: 2600 },
];

const columns: DataTableColumn<VehicleRate>[] = [
  {
    id: "type",
    header: "Type",
    cell: (rate) => rate.type,
    className: "font-medium",
  },
  {
    id: "plan",
    header: "Subscription plan",
    cell: (rate) => (
      <Badge variant="secondary" className="rounded-md">
        {rate.plan}
      </Badge>
    ),
  },
  {
    id: "capacity",
    header: "Capacity",
    cell: (rate) => `${rate.capacityKg.toLocaleString("en-PH")} kg`,
    className: "text-right",
  },
  {
    id: "baseFare",
    header: "Base fare",
    cell: (rate) => formatPesos(rate.baseFare),
    className: "text-right",
  },
];

export function VehicleRatesSettings() {
  const [query, setQuery] = useState("");
  const rows = filterTableRows(vehicleRates, query, (row) => [
    row.type,
    row.plan,
  ]);
  return (
    <Card
      aria-labelledby="vehicle-rates-heading"
      className="min-w-0 gap-0 pb-0"
    >
      <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-3 border-b">
        <div className="space-y-1">
          <CardTitle id="vehicle-rates-heading">
            Vehicle types and sample rates
          </CardTitle>
          <CardDescription>
            Reference fares used for booking estimates.
          </CardDescription>
        </div>
        <TableSearch
          label="Search vehicle rates"
          placeholder="Search type or plan…"
          value={query}
          onValueChange={setQuery}
        />
      </CardHeader>
      <PaginatedTable
        key={query}
        data={rows}
        columns={columns}
        getRowId={(rate) => rate.type}
        labelledBy="vehicle-rates-heading"
        className="min-w-lg"
      />
    </Card>
  );
}
