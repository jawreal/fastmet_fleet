import { AppShell } from "@/components/AppShell";
import { CompanySettings } from "@/components/settings/CompanySettings";
import { PayoutsSettings } from "@/components/settings/PayoutsSettings";
import { FleetDataSettings } from "@/components/settings/FleetDataSettings";
import { VehicleRatesSettings } from "@/components/settings/VehicleRatesSettings";

export default function Page() {
  return (
    <AppShell title="Settings">
      <div className="@container mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="space-y-1 border-b pb-4">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Company, payouts and data</p>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-6 @min-[48rem]:grid-cols-2">
          <CompanySettings />
          <PayoutsSettings />
        </div>
        <VehicleRatesSettings />
        <FleetDataSettings />
      </div>
    </AppShell>
  );
}
