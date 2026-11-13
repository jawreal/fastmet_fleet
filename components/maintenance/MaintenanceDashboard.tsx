"use client";

import { TableSearch } from "@/components/TableSearch";
import { filterTableRows } from "@/lib/tableSearch";

import { useMemo, useState } from "react";
import { AlertTriangle, Clock3, Wrench, Banknote, Plus } from "lucide-react";
import { EarningsSummaryCard } from "@/components/earnings/EarningsSummaryCard";
import { PaginatedTable } from "@/components/PaginatedTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  maintenanceTrucks,
  initialScheduledServices,
  initialServiceHistory,
  getServiceStatus,
  formatMaintenancePesos,
  type ScheduledService,
  type CompletedService,
} from "@/lib/maintenanceData";
import { cn } from "@/lib/utils";
import { createServiceColumns, historyColumns } from "./MaintenanceColumns";
import { ScheduleServiceDialog } from "./ScheduleServiceDialog";
import { CompleteServiceDialog } from "./CompleteServiceDialog";

export function MaintenanceDashboard() {
  const [serviceQuery, setServiceQuery] = useState("");
  const [historyQuery, setHistoryQuery] = useState("");
  /*TAKE_NOTE: MOCK UP */
  const [trucks, setTrucks] = useState(maintenanceTrucks);
  const [services, setServices] = useState(initialScheduledServices);
  const [history, setHistory] = useState(initialServiceHistory);
  const [scheduling, setScheduling] = useState(false);
  const [editing, setEditing] = useState<ScheduledService | null>(null);
  const [completing, setCompleting] = useState<ScheduledService | null>(null);
  const columns = useMemo(
    () =>
      createServiceColumns({
        trucks,
        onComplete: setCompleting,
        onEdit: setEditing,
      }),
    [trucks],
  );
  const statuses = services.map((service) =>
    getServiceStatus(
      service,
      trucks.find((truck) => truck.plate === service.plate)!,
    ),
  );
  /*TAKE_NOTE: MOCK UP */
  const recent = history.filter(
    (entry) => entry.date >= "2026-10-14" && entry.date <= "2026-11-12",
  );
  const metrics = [
    {
      title: "Overdue",
      value: String(statuses.filter((status) => status === "Overdue").length),
      description: "Past due date or odometer",
      icon: AlertTriangle,
    },
    {
      title: "Due within 7 days",
      value: String(statuses.filter((status) => status === "Due soon").length),
      description: "Or within 500 km",
      icon: Clock3,
    },
    {
      title: "Scheduled",
      value: String(services.length),
      description: "Open service items",
      icon: Wrench,
    },
    {
      title: "Spent, last 30 days",
      value: formatMaintenancePesos(
        recent.reduce((sum, entry) => sum + entry.cost, 0),
      ),
      description: `${recent.length} completed services`,
      icon: Banknote,
    },
  ];
  const filteredServices = filterTableRows(services, serviceQuery, (row) => [
    row.plate,
    row.kind,
    row.shop,
    row.notes,
    row.dueDate,
  ]);
  const filteredHistory = filterTableRows(history, historyQuery, (row) => [
    row.plate,
    row.kind,
    row.shop,
    row.notes,
    row.date,
  ]).sort((a, b) => b.date.localeCompare(a.date));
  /*TAKE_NOTE: MOCK UP */
  function saveService(service: ScheduledService) {
    setServices((current) =>
      current.some((item) => item.id === service.id)
        ? current.map((item) => (item.id === service.id ? service : item))
        : [...current, service],
    );
  }
  /*TAKE_NOTE: MOCK UP */
  function completeService(entry: CompletedService) {
    setHistory((current) => [entry, ...current]);
    setServices((current) =>
      current.filter((service) => service.id !== entry.id),
    );
    setTrucks((current) =>
      current.map((truck) =>
        truck.plate === entry.plate
          ? {
              ...truck,
              odometer: Math.max(truck.odometer, entry.odometer),
              nextPms:
                entry.kind === "PMS"
                  ? entry.odometer + truck.interval
                  : truck.nextPms,
            }
          : truck,
      ),
    );
  }
  return (
    <div className="@container flex flex-col gap-5">
      {/* ------ Page header --------- */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Maintenance</h1>
        <p className="text-sm text-muted-foreground">
          Preventive maintenance and repairs.
        </p>
      </header>
      {/* ------ Maintenance summary cards --------- */}
      <div className="grid gap-4 @sm:grid-cols-2 @4xl:grid-cols-4">
        {metrics.map((metric) => (
          <EarningsSummaryCard
            key={metric.title}
            {...metric}
            footer={
              <span className="text-xs text-muted-foreground">
                As of 12 Nov 2026
              </span>
            }
          />
        ))}
      </div>
      {/* ------ Upcoming service table --------- */}
      <Card className="gap-0">
        <CardHeader className="flex flex-col md:flex-row items-center gap-3 pb-4">
          <div className="space-y-1 w-full">
            <CardTitle id="upcoming-service-heading">
              Upcoming service
            </CardTitle>
            <CardDescription>
              Sample records. Changes last for this preview session.
            </CardDescription>
          </div>
          <div className="flex w-full items-center justify-end gap-x-2">
            <TableSearch
              label="Search upcoming services"
              placeholder="Search truck, service or shop…"
              value={serviceQuery}
              onValueChange={setServiceQuery}
            />
            <Button onClick={() => setScheduling(true)}>
              <Plus />
              Schedule service
            </Button>
          </div>
        </CardHeader>
        <PaginatedTable
          key={`${services.length}-${serviceQuery}`}
          data={filteredServices}
          columns={columns}
          getRowId={(row) => row.id}
          labelledBy="upcoming-service-heading"
        />
      </Card>
      {/* ------ PMS mileage meters by truck --------- */}
      <Card>
        <CardHeader>
          <CardTitle>PMS by truck</CardTitle>
          <CardDescription>
            Distance remaining until the next preventive maintenance service.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-x-6 gap-y-4 @xl:grid-cols-2">
            {trucks.map((truck) => {
              const remaining = truck.nextPms - truck.odometer;
              const usage = Math.min(
                100,
                Math.max(0, 1 - remaining / truck.interval) * 100,
              );
              let meterColor = "bg-muted-foreground/40";
              if (remaining < 0) {
                meterColor = "bg-destructive";
              } else if (remaining <= 500) {
                meterColor = "bg-primary";
              }
              return (
                <li key={truck.plate} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline" className="rounded-sm font-mono">
                      {truck.plate}
                    </Badge>
                    <span
                      className={cn(
                        "text-xs tabular-nums",
                        remaining < 0
                          ? "text-destructive"
                          : "text-muted-foreground",
                      )}
                    >
                      {Math.abs(remaining).toLocaleString("en-PH")} km{" "}
                      {remaining < 0 ? "overdue" : "left"}
                    </span>
                  </div>
                  <meter
                    className="sr-only"
                    aria-label={`PMS interval used for ${truck.plate}`}
                    min={0}
                    max={100}
                    value={usage}
                  >
                    {Math.round(usage)}%
                  </meter>
                  {/* Custom visual keeps the theme consistent across browsers; the native meter provides accessibility. */}
                  <div
                    aria-hidden="true"
                    className="h-1.5 overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className={cn("h-full rounded-full", meterColor)}
                      style={{ width: `${usage}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
      {/* ------ Service history table --------- */}
      <Card className="gap-0">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-3 pb-4">
          <div className="space-y-1">
            <CardTitle id="service-history-heading">Service history</CardTitle>
            <CardDescription>
              Completed maintenance and actual costs.
            </CardDescription>
          </div>
          <TableSearch
            label="Search service history"
            placeholder="Search truck, service or shop…"
            value={historyQuery}
            onValueChange={setHistoryQuery}
          />
        </CardHeader>
        <PaginatedTable
          key={`${history.length}-${historyQuery}`}
          data={filteredHistory}
          columns={historyColumns}
          getRowId={(row) => row.id}
          labelledBy="service-history-heading"
        />
      </Card>
      {/* ------ Schedule or edit service dialog --------- */}
      {(scheduling || editing) && (
        <ScheduleServiceDialog
          trucks={trucks}
          service={editing ?? undefined}
          onSave={saveService}
          onClose={() => {
            setScheduling(false);
            setEditing(null);
          }}
        />
      )}
      {/* ------ Complete service dialog --------- */}
      {completing && (
        <CompleteServiceDialog
          service={completing}
          truck={trucks.find((truck) => truck.plate === completing.plate)!}
          onComplete={completeService}
          onClose={() => setCompleting(null)}
        />
      )}
    </div>
  );
}
