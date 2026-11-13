"use client";

import { useMemo, useState } from "react";
import { Fuel, Banknote, Gauge, Route, Plus, Trash2 } from "lucide-react";
import { DeleteFillUpDialog } from "./DeleteFillUpDialog";
import { EarningsSummaryCard } from "@/components/earnings/EarningsSummaryCard";
import {
  PaginatedTable,
  type DataTableColumn,
} from "@/components/PaginatedTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  fuelTrucks,
  initialFillUps,
  getFuelEconomy,
  formatFuelPesos,
  type FillUp,
} from "@/lib/fuelData";
import { cn } from "@/lib/utils";
import { LogFillUpDialog } from "./LogFillUpDialog";
import { TableSearch } from "@/components/TableSearch";
import { filterTableRows } from "@/lib/tableSearch";

interface TruckEconomy {
  plate: string;
  type: string;
  fillUps: number;
  liters: number;
  spend: number;
  economy: number | null;
  typical: number;
}
const economyColumns: DataTableColumn<TruckEconomy>[] = [
  {
    id: "truck",
    header: "Truck",
    cell: (row) => (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="rounded-sm font-mono">
          {row.plate}
        </Badge>
        <span className="text-muted-foreground">{row.type}</span>
      </div>
    ),
  },
  {
    id: "count",
    header: "Fill-ups",
    className: "text-right",
    cell: (row) => row.fillUps,
  },
  {
    id: "liters",
    header: "Liters",
    className: "text-right",
    cell: (row) =>
      row.liters.toLocaleString("en-PH", { maximumFractionDigits: 1 }),
  },
  {
    id: "spend",
    header: "Spend",
    className: "text-right",
    cell: (row) => formatFuelPesos(row.spend),
  },
  {
    id: "economy",
    header: "km/L",
    className: "text-right",
    cell: (row) => (
      <span
        className={cn(
          "font-medium",
          row.economy !== null &&
            row.economy < row.typical * 0.85 &&
            "text-destructive",
        )}
      >
        {row.economy?.toFixed(1) ?? "—"}
      </span>
    ),
  },
  {
    id: "typical",
    header: "Typical",
    className: "text-right text-muted-foreground",
    cell: (row) => row.typical.toFixed(1),
  },
];

function createLogColumns(
  onDelete: (entry: FillUp) => void,
): DataTableColumn<FillUp>[] {
  return [
    {
      id: "date",
      header: "Date",
      className: "whitespace-nowrap",
      cell: (row) => (
        <div>
          <p>
            {new Intl.DateTimeFormat("en-PH", {
              weekday: "short",
              month: "short",
              day: "numeric",
              timeZone: "Asia/Manila",
            }).format(new Date(`${row.date}T12:00:00+08:00`))}
          </p>
          <p className="text-xs text-muted-foreground">{row.station || "—"}</p>
        </div>
      ),
    },
    {
      id: "truck",
      header: "Truck",
      cell: (row) => (
        <div>
          <Badge variant="outline" className="rounded-sm font-mono">
            {row.plate}
          </Badge>
          <p className="mt-1 text-xs text-muted-foreground">
            {row.driver || "Unassigned"}
          </p>
        </div>
      ),
    },
    {
      id: "liters",
      header: "Liters",
      className: "text-right",
      cell: (row) => row.liters.toFixed(1),
    },
    {
      id: "price",
      header: "₱/L",
      className: "text-right",
      cell: (row) => row.price.toFixed(2),
    },
    {
      id: "total",
      header: "Total",
      className: "text-right",
      cell: (row) => formatFuelPesos(row.liters * row.price),
    },
    {
      id: "odometer",
      header: "Odometer",
      className: "text-right",
      cell: (row) => row.odometer.toLocaleString("en-PH"),
    },
    {
      id: "actions",
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete fill-up for ${row.plate} on ${row.date}`}
          onClick={() => onDelete(row)}
        >
          <Trash2 className="size-3.5 text-muted-foreground" />
        </Button>
      ),
    },
  ];
}

export function FuelDashboard() {
  /*TAKE_NOTE: MOCK UP */
  const [entries, setEntries] = useState(initialFillUps);
  const [logging, setLogging] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<FillUp | null>(null);
  const [economyQuery, setEconomyQuery] = useState("");
  const [logQuery, setLogQuery] = useState("");
  /*TAKE_NOTE: MOCK UP */
  // Fixed sample reporting date; replace with the reporting period from live data.
  const recent = entries.filter(
    (entry) => entry.date >= "2026-10-14" && entry.date <= "2026-11-12",
  );
  const liters = recent.reduce((sum, entry) => sum + entry.liters, 0);
  const spend = recent.reduce(
    (sum, entry) => sum + entry.liters * entry.price,
    0,
  );
  const economies = fuelTrucks.map((truck) => {
    const fills = recent.filter((entry) => entry.plate === truck.plate);
    return {
      ...truck,
      fillUps: fills.length,
      liters: fills.reduce((sum, entry) => sum + entry.liters, 0),
      spend: fills.reduce((sum, entry) => sum + entry.liters * entry.price, 0),
      ...getFuelEconomy(fills),
    };
  });
  const distance = economies.reduce((sum, truck) => sum + truck.distance, 0);
  const filteredEconomies = filterTableRows(
    economies,
    economyQuery,
    (truck) => [truck.plate, truck.type],
  );
  const filteredEntries = filterTableRows(entries, logQuery, (entry) => [
    entry.plate,
    entry.driver,
    entry.station,
    entry.date,
    new Intl.DateTimeFormat("en-PH", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Manila",
    }).format(new Date(`${entry.date}T12:00:00+08:00`)),
  ]).sort((a, b) => b.date.localeCompare(a.date) || b.odometer - a.odometer);
  const measuredLiters = economies.reduce(
    (sum, truck) => sum + truck.measuredLiters,
    0,
  );
  const metrics = [
    {
      title: "Diesel, last 30 days",
      value: `${liters.toLocaleString("en-PH")} L`,
      description: `${recent.length} fill-ups`,
      icon: Fuel,
    },
    {
      title: "Fuel spend, last 30 days",
      value: formatFuelPesos(spend),
      description: "Across all trucks",
      icon: Banknote,
    },
    {
      title: "Average price",
      value: liters ? `₱${(spend / liters).toFixed(2)}/L` : "—",
      description: "Weighted by liters",
      icon: Gauge,
    },
    {
      title: "Distance logged",
      value: `${distance.toLocaleString("en-PH")} km`,
      description: measuredLiters
        ? `Fleet average ${(distance / measuredLiters).toFixed(1)} km/L`
        : "Needs two fill-ups per truck",
      icon: Route,
    },
  ];
  const logColumns = useMemo(
    () => createLogColumns(setDeletingEntry),
    [setDeletingEntry],
  );
  return (
    <div className="@container flex flex-col gap-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Fuel</h1>
        <p className="text-sm text-muted-foreground">
          Fill-ups and fuel economy.
        </p>
      </header>
      <div className="grid gap-4 @sm:grid-cols-2 @4xl:grid-cols-4">
        {metrics.map((metric) => (
          <EarningsSummaryCard
            key={metric.title}
            {...metric}
            footer={
              <span className="text-xs text-muted-foreground">
                14 Oct – 12 Nov 2026
              </span>
            }
          />
        ))}
      </div>
      <Card className="gap-0">
        <CardHeader className="flex flex-wrap flex-row items-center justify-between gap-3 pb-4">
          <div className="space-y-1">
            <CardTitle id="fuel-economy-heading">
              Fuel economy by truck
            </CardTitle>
            <CardDescription>
              Consumption and costs over the last 30 days.
            </CardDescription>
          </div>
          <TableSearch
            label="Search fuel economy"
            placeholder="Search truck or type…"
            value={economyQuery}
            onValueChange={setEconomyQuery}
          />
        </CardHeader>
        <PaginatedTable
          key={economyQuery}
          data={filteredEconomies}
          columns={economyColumns}
          getRowId={(row) => row.plate}
          labelledBy="fuel-economy-heading"
        />
        <CardFooter className="pt-3 text-muted-foreground">
          km/L uses the full-tank method: distance between two fill-ups divided
          by liters at the second. Red means more than 15% below typical for the
          truck type.
        </CardFooter>
      </Card>
      <Card className="gap-0">
        <CardHeader className="flex flex-col md:flex-row items-center gap-3 pb-4">
          <div className="space-y-1 w-full">
            <CardTitle id="fill-up-log-heading">Fill-up log</CardTitle>
            <CardDescription>
              Sample records. Changes last for this preview session.
            </CardDescription>
          </div>
          <div className="flex w-full items-center justify-end gap-x-2">
            <TableSearch
              label="Search fill-up log"
              placeholder="Search truck, driver or station…"
              value={logQuery}
              onValueChange={setLogQuery}
            />
            <Button onClick={() => setLogging(true)}>
              <Plus />
              Log fill-up
            </Button>
          </div>
        </CardHeader>
        <PaginatedTable
          key={`${entries.length}-${logQuery}`}
          data={filteredEntries}
          columns={logColumns}
          getRowId={(row) => row.id}
          labelledBy="fill-up-log-heading"
        />
      </Card>
      {deletingEntry && (
        <DeleteFillUpDialog
          entry={deletingEntry}
          onClose={() => setDeletingEntry(null)}
          onConfirm={() => {
            setEntries((current) =>
              current.filter((entry) => entry.id !== deletingEntry.id),
            );
            setDeletingEntry(null);
          }}
        />
      )}
      {logging && (
        <LogFillUpDialog
          entries={entries}
          onSave={(entry) => setEntries((current) => [entry, ...current])}
          onClose={() => setLogging(false)}
        />
      )}
    </div>
  );
}
