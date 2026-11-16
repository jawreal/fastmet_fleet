"use client";

import { TableSearch } from "@/components/TableSearch";
import { filterTableRows } from "@/lib/tableSearch";

import { useId, useState } from "react";
import { CircleAlertIcon, StarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  PaginatedTable,
  type DataTableColumn,
} from "@/components/PaginatedTable";
import { cn } from "@/lib/utils";
import { formatPesos } from "@/lib/reportData";
import { AddCrewDialog } from "./AddCrewDialog";
import { sampleCrew, type CrewMember, type CrewRole } from "../../lib/crewData";

interface ICrewStatusBadge {
  status: CrewMember["status"];
}

function CrewStatusBadge({ status }: Readonly<ICrewStatusBadge>) {
  return (
    <Badge variant="outline" className="gap-1.5 rounded-sm">
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          status === "On trip" && "bg-primary",
          status === "On duty" && "bg-emerald-500",
          status === "Off duty" && "bg-muted-foreground/50",
        )}
      />
      {status}
    </Badge>
  );
}

const columns: DataTableColumn<CrewMember>[] = [
  {
    id: "name",
    header: "Name",
    cell: (person) => (
      <div className="space-y-1">
        <p className="font-medium">{person.name}</p>
        <p className="text-xs text-muted-foreground">{person.phone}</p>
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (person) => <CrewStatusBadge status={person.status} />,
  },
  {
    id: "vehicle",
    header: "Assigned vehicle",
    cell: (person) =>
      person.vehicle || <span className="text-muted-foreground">Reliever</span>,
  },
  {
    id: "license",
    header: "License",
    cell: (person) => (
      <div className="space-y-1">
        <p>{person.license || "—"}</p>
        <p className="text-xs text-muted-foreground">{person.codes}</p>
        {person.licenseWarning && (
          <Badge variant="destructive" className="rounded-sm">
            <CircleAlertIcon aria-hidden="true" data-icon="inline-start" />
            {person.licenseWarning}
          </Badge>
        )}
      </div>
    ),
  },
  {
    id: "payScheme",
    header: "Pay scheme",
    cell: (person) =>
      person.payType === "daily"
        ? `${formatPesos(person.rate)} / day`
        : `${person.rate}% of fare`,
  },
  {
    id: "rating",
    header: "Rating",
    cell: (person) =>
      person.rating === null ? (
        <span className="text-muted-foreground">Not rated</span>
      ) : (
        <span className="inline-flex items-center gap-1">
          <StarIcon
            aria-hidden="true"
            className="size-3 fill-primary text-primary"
          />
          {person.rating.toFixed(1)}
        </span>
      ),
  },
  {
    id: "trips",
    header: "Trips this week",
    cell: (person) => person.trips,
    className: "text-right",
  },
  {
    id: "pay",
    header: "Pay this week",
    cell: (person) => formatPesos(person.pay),
    className: "text-right font-medium",
  },
];
const helperColumns = columns.filter((column) => column.id !== "license");

export function DriversHelpers() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<CrewRole>("Driver");
  /*TAKE_NOTE: MOCK UP */
  const [crew, setCrew] = useState(sampleCrew);
  const [notice, setNotice] = useState("");
  const id = useId();

  /*TAKE_NOTE: MOCK UP */
  const visibleCrew = crew
    .filter((person) => person.role === role)
    .sort((a, b) => a.name.localeCompare(b.name));

  /*TAKE_NOTE: MOCK UP */
  const filteredCrew = filterTableRows(visibleCrew, query, (person) => [
    person.name,
    person.phone,
    person.vehicle,
    person.status,
    person.license,
    person.codes,
  ]);

  /*TAKE_NOTE: MOCK UP */
  function addPerson(person: CrewMember) {
    // Keep a single assigned person per role and vehicle, matching the fleet model.
    setCrew((current) => [
      ...current.map((member) =>
        person.vehicle &&
        member.role === person.role &&
        member.vehicle === person.vehicle
          ? { ...member, vehicle: "" }
          : member,
      ),
      person,
    ]);
    setRole(person.role);
    setNotice(
      `${person.name} added to this demo. Changes are cleared when you refresh.`,
    );
  }

  return (
    <div className="@container flex min-w-0 flex-col gap-5">
      <div className="space-y-1">
        <h1
          id={`${id}-heading`}
          className="text-2xl font-semibold tracking-tight"
        >
          Drivers & helpers
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your crew, vehicle assignments, and pay schemes.
        </p>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <fieldset className="m-0 max-w-full border-0 p-0">
          <legend className="sr-only">Show crew by role</legend>
          <div className="flex max-w-full overflow-x-auto border-b border-border">
            {(["Driver", "Helper"] as const).map((item) => (
              <Button
                key={item}
                type="button"
                variant="ghost"
                aria-pressed={role === item}
                aria-controls={`${id}-table`}
                onClick={() => setRole(item)}
                className={cn(
                  "h-8 gap-2 rounded-none rounded-t-md border-0 border-b-2 border-transparent px-3 text-muted-foreground active:not-aria-[haspopup]:translate-y-0",
                  role === item &&
                    "border-primary bg-primary/10 text-yellow-600 hover:bg-primary/15 hover:text-primary",
                )}
              >
                {item}s{" "}
                <Badge
                  variant="secondary"
                  className="h-4 min-w-4 rounded-sm px-1 tabular-nums"
                >
                  {crew.filter((person) => person.role === item).length}
                </Badge>
              </Button>
            ))}
          </div>
        </fieldset>
        <div className="flex w-full items-center justify-end gap-x-2">
          <TableSearch
            label="Search crew"
            placeholder="Search name, vehicle or status…"
            value={query}
            onValueChange={setQuery}
          />
          <AddCrewDialog role={role} onAdd={addPerson} />
        </div>
      </div>
      {notice && (
        <p className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs">
          {notice}
        </p>
      )}
      <Card id={`${id}-table`} className="min-w-0 gap-0 overflow-hidden py-0">
        <h2 id={`${id}-table-heading`} className="sr-only">
          {role}s
        </h2>
        <PaginatedTable
          key={`${role}-${query}`}
          data={filteredCrew}
          columns={role === "Driver" ? columns : helperColumns}
          getRowId={(person) => person.id}
          labelledBy={`${id}-table-heading`}
          className="min-w-225"
        />
      </Card>
      <p className="text-xs/relaxed text-muted-foreground">
        Pay is an estimate from completed trips: percentage drivers earn a share
        of each fare, daily-rate crew earn their rate for each day with a
        completed trip.
      </p>
    </div>
  );
}
