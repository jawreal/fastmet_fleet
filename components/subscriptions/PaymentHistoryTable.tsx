"use client";

import { PaginatedTable, type DataTableColumn } from "@/components/PaginatedTable";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { subscriptionPayments, type SubscriptionPayment } from "@/lib/paymentHistoryData";
import { formatPesos } from "@/lib/reportData";

const paymentDateFormatter = new Intl.DateTimeFormat("en-PH", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Manila",
});

const coverageDateFormatter = new Intl.DateTimeFormat("en-PH", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "Asia/Manila",
});

function PaymentItem({ payment }: Readonly<{ payment: SubscriptionPayment }>) {
  return (
    <div className="space-y-1">
      <p>{payment.item}</p>
      {payment.coverageEnd && (
        <p className="text-xs text-muted-foreground">
          Covers to{" "}
          {coverageDateFormatter.format(new Date(`${payment.coverageEnd}T00:00:00+08:00`))}
        </p>
      )}
    </div>
  );
}

// Module-level renderers keep cell identities stable across pagination changes.
const columns: DataTableColumn<SubscriptionPayment>[] = [
  {
    id: "date",
    header: "Date",
    cell: (payment) => (
      <time dateTime={payment.paidAt}>
        {paymentDateFormatter.format(new Date(payment.paidAt))}
      </time>
    ),
  },
  { id: "vehicle", header: "Vehicle", cell: (payment) => payment.vehiclePlate },
  { id: "item", header: "Item", cell: (payment) => <PaymentItem payment={payment} /> },
  { id: "paidWith", header: "Paid with", cell: (payment) => payment.paymentMethod },
  {
    id: "amount",
    header: "Amount",
    className: "text-right",
    cell: (payment) => formatPesos(payment.amount),
  },
];

export function PaymentHistoryTable() {
  return (
    <Card className="min-w-0 gap-0 pb-0" aria-labelledby="paymentHistoryHeading">
      <CardHeader className="border-b">
        <CardTitle id="paymentHistoryHeading">Payment history</CardTitle>
      </CardHeader>
      <PaginatedTable
        data={subscriptionPayments}
        columns={columns}
        getRowId={(payment) => payment.id}
        labelledBy="paymentHistoryHeading"
        className="min-w-min-w-180"
      />
    </Card>
  );
}
