import { NewBookingDialog } from "@/components/bookings/NewBookingDialog";
import { Badge } from "@/components/ui/badge";
import { SubscriptionPlans } from "./SubscriptionPlans";
import { SubscriptionSummary } from "./SubscriptionSummary";
import { VehicleSlotsTable } from "./VehicleSlotsTable";

export function SubscriptionsDashboard() {
  return (
    <div className="@container mx-auto flex w-full max-w-6xl flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Subscriptions
          </h1>
          <p className="text-sm text-muted-foreground">
            Monthly slot per vehicle and deposits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1.5">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-emerald-500"
            />{" "}
            Synced
          </Badge>
          <NewBookingDialog />
        </div>
      </header>

      <SubscriptionPlans />
      <SubscriptionSummary />
      <VehicleSlotsTable />
    </div>
  );
}
