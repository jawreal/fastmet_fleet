"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PaginatedTable, type DataTableColumn } from "@/components/PaginatedTable";
import { crewReports, formatPesos, type CrewReportData } from "@/lib/reportData";

const columns: DataTableColumn<CrewReportData>[] = [
  { id: "name", header: "Name", cell: (person) => person.name, className: "font-medium" },
  { id: "role", header: "Role", cell: (person) => person.role },
  { id: "trips", header: "Trips", cell: (person) => person.trips, className: "text-right" },
  { id: "fares", header: "Fares driven", cell: (person) => person.fares === null ? "—" : formatPesos(person.fares), className: "text-right" },
  { id: "payScheme", header: "Pay scheme", cell: (person) => person.payScheme },
  { id: "estimatedPay", header: "Estimated pay", cell: (person) => formatPesos(person.estimatedPay), className: "text-right font-semibold" },
];

export function DriverHelperReport() {
  return (
    <Card className="min-w-0 gap-0 pb-0" aria-labelledby="crewReportHeading">
      <CardHeader className="border-b">
        <CardTitle id="crewReportHeading">By driver and helper</CardTitle>
      </CardHeader>
      <PaginatedTable data={crewReports} columns={columns} getRowId={(person) => person.name} labelledBy="crewReportHeading" className="min-w-175" />
    </Card>
  );
}
