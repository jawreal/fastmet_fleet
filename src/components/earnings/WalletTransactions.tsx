"use client";

import { TableSearch } from "@/components/TableSearch";
import { filterTableRows } from "@/lib/tableSearch";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PaginatedTable,
  type DataTableColumn,
} from "@/components/PaginatedTable";
import { cn } from "@/lib/utils";

const filters = [
  "All",
  "Trips",
  "Top-ups",
  "Subscriptions",
  "Cash outs",
] as const;
type Filter = (typeof filters)[number];
interface Transaction {
  id: string;
  date: string;
  type: string;
  category: Exclude<Filter, "All">;
  details: string;
  booking: string | null;
  amount: number;
  status: "Settled" | "Pending";
}
/*TAKE_NOTE: MOCK UP */
const transactions: Transaction[] = [
  {
    id: "SUB-0031",
    date: "Wed, Nov 4, 9:00 AM",
    type: "Subscription",
    category: "Subscriptions",
    details: "Subscription · NEX 3317 · 1 mo",
    booking: null,
    amount: -300,
    status: "Settled",
  },
  {
    id: "SUB-0030",
    date: "Tue, Oct 27, 9:00 AM",
    type: "Subscription",
    category: "Subscriptions",
    details: "Subscription · NDA 7183 · 1 mo",
    booking: null,
    amount: -300,
    status: "Settled",
  },
  {
    id: "SUB-0029",
    date: "Tue, Oct 27, 9:00 AM",
    type: "Subscription",
    category: "Subscriptions",
    details: "Subscription · NBC 4522 · 1 mo",
    booking: null,
    amount: -300,
    status: "Settled",
  },
  {
    id: "FM-1048",
    date: "Mon, Oct 12, 2:30 PM",
    type: "Trip payment",
    category: "Trips",
    details: "Manila → Calamba · GCash",
    booking: "FM-1048",
    amount: 7770,
    status: "Settled",
  },
  {
    id: "PO-0026",
    date: "Sun, Oct 11, 3:00 PM",
    type: "Cash out",
    category: "Cash outs",
    details: "GCash · •••• 0142",
    booking: null,
    amount: -10000,
    status: "Settled",
  },
  {
    id: "TU-0019",
    date: "Sun, Oct 11, 10:00 AM",
    type: "Top-up",
    category: "Top-ups",
    details: "Wallet top-up · GCash",
    booking: null,
    amount: 2000,
    status: "Pending",
  },
  {
    id: "FM-1042",
    date: "Fri, Oct 9, 4:15 PM",
    type: "Trip payment",
    category: "Trips",
    details: "Pasig → Santa Rosa · QR Ph",
    booking: "FM-1042",
    amount: 8000,
    status: "Settled",
  },
];
const pesos = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

const columns: DataTableColumn<Transaction>[] = [
  {
    id: "date",
    header: "Date",
    className: "whitespace-nowrap",
    cell: (row) => row.date,
  },
  {
    id: "type",
    header: "Type",
    cell: (row) => (
      <Badge
        variant="outline"
        className="gap-1.5 whitespace-nowrap font-normal"
      >
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-muted-foreground"
        />
        {row.type}
      </Badge>
    ),
  },
  {
    id: "details",
    header: "Details",
    className: "min-w-52",
    cell: (row) => row.details,
  },
  {
    id: "booking",
    header: "Booking",
    className: "text-muted-foreground",
    cell: (row) => row.booking ?? "—",
  },
  {
    id: "amount",
    header: "Amount",
    className: "text-right whitespace-nowrap",
    cell: (row) => (
      <span className={row.amount < 0 ? "text-destructive" : "font-medium"}>
        {row.amount > 0 ? "+" : ""}
        {pesos.format(row.amount)}
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => (
      <Badge
        variant={row.status === "Pending" ? "outline" : "secondary"}
        className="gap-1.5 whitespace-nowrap font-normal text-muted-foreground"
      >
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 rounded-full",
            row.status === "Pending" ? "bg-primary" : "bg-muted-foreground",
          )}
        />
        {row.status}
      </Badge>
    ),
  },
];

export function WalletTransactions() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const rows = transactions.filter(
    (row) => filter === "All" || row.category === filter,
  );

  const filteredRows = filterTableRows(rows, query, (row) => [
    row.date,
    row.type,
    row.details,
    row.booking,
    row.status,
  ]);
  return (
    <Card className="gap-0" aria-labelledby="wallet-transactions-heading">
      <CardHeader className="flex flex-col md:flex-row items-center gap-3 pb-4">
        <CardTitle id="wallet-transactions-heading" className="w-full">
          Wallet transactions
        </CardTitle>
        <div className="flex w-full items-center justify-end gap-x-2">
          <Select
            value={filter}
            items={filters.map((value) => ({
              value,
              label: value === "All" ? "All transactions" : value,
            }))}
            onValueChange={(value) => {
              if (value && filters.includes(value as Filter)) {
                setFilter(value as Filter);
              }
            }}
          >
            <SelectTrigger
              aria-label="Filter transaction type"
              className="min-w-32 shrink-0"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filters.map((item) => (
                <SelectItem key={item} value={item}>
                  {item === "All" ? "All transactions" : item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TableSearch
            label="Search wallet transactions"
            placeholder="Search type, details or booking…"
            value={query}
            onValueChange={setQuery}
          />
        </div>
      </CardHeader>
      <div id="wallet-transactions-table">
        <PaginatedTable
          key={`${filter}-${query}`}
          data={filteredRows}
          columns={columns}
          getRowId={(row) => row.id}
          labelledBy="wallet-transactions-heading"
          className="border-t"
        />
      </div>
    </Card>
  );
}
