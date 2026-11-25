import { protectFleetPage } from "@/lib/auth/server/protectPage";
import { AppShell } from "@/components/AppShell";
import { FuelDashboard } from "@/components/fuel/FuelDashboard";

function Page() {
  return (
    <AppShell title="Fuel">
      <FuelDashboard />
    </AppShell>
  );
}

export default protectFleetPage(Page);
