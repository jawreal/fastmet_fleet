import { formatPesos } from "@/lib/reportData";
import {
  formatRenewalDate,
  subscriptionPlans,
  vehicleSlots,
} from "../../lib/SubscriptionData";

export function SubscriptionSummary() {
  const activeSlots = vehicleSlots.filter((slot) => slot.status === "Active");
  const expiredCount = vehicleSlots.filter(
    (slot) => slot.status === "Expired",
  ).length;
  const noSlotCount = vehicleSlots.filter(
    (slot) => slot.status === "No slot",
  ).length;
  const monthlyTotal = activeSlots.reduce(
    (total, slot) => total + slot.monthlyPrice,
    0,
  );
  const depositsHeld = vehicleSlots.reduce(
    (total, slot) => total + (slot.deposit ?? 0),
    0,
  );
  const regularTotal = activeSlots.reduce((total, slot) => {
    const plan = subscriptionPlans.find((plan) => plan.name === slot.plan);
    return total + (plan?.regularPrice ?? slot.monthlyPrice);
  }, 0);
  const nextRenewal = [...activeSlots].sort((a, b) =>
    a.renewalDate.localeCompare(b.renewalDate),
  )[0];

  const summaryItems = [
    {
      label: "Active slots",
      value: `${activeSlots.length} / ${vehicleSlots.length}`,
      description: [
        `${expiredCount} need renewal`,
        noSlotCount ? `${noSlotCount} awaiting approval` : null,
      ]
        .filter(Boolean)
        .join(" · "),
    },
    {
      label: "Monthly subscription",
      value: formatPesos(monthlyTotal),
      description: `Save ${formatPesos(regularTotal - monthlyTotal)} a month at 80% off`,
    },
    {
      label: "Deposits held",
      value: formatPesos(depositsHeld),
      description: "Refunded when you release a slot",
    },
    {
      label: "Next renewal",
      value: nextRenewal
        ? formatRenewalDate(nextRenewal.renewalDate)
        : "No renewals due",
      description: nextRenewal
        ? `${nextRenewal.plate} · ${formatPesos(nextRenewal.monthlyPrice)}`
        : "All slots are up to date",
    },
  ];

  return (
    <section
      aria-label="Subscription summary"
      className="overflow-hidden rounded-lg border bg-border"
    >
      <dl className="grid gap-px @min-[30rem]:grid-cols-2 @min-[60rem]:grid-cols-4">
        {summaryItems.map((item) => (
          <div key={item.label} className="space-y-1 bg-card p-4">
            <dt className="text-xs text-muted-foreground">{item.label}</dt>
            <dd className="text-lg font-semibold tracking-tight tabular-nums">
              {item.value}
            </dd>
            <dd className="text-xs/relaxed text-muted-foreground">
              {item.description}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
