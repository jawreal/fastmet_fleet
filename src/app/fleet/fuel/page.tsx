import { AppShell } from "@/components/AppShell";
import { FuelDashboard } from "@/components/fuel/FuelDashboard";

export default function Page() {
  return (
    <AppShell title="Fuel">
      <FuelDashboard />
    </AppShell>
  );
}
