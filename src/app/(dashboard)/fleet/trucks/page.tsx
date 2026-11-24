import { protectFleetPage } from "@/lib/auth/server/protectPage";
import { AppShell } from "@/components/AppShell";
import { TrucksDashboard } from "@/components/trucks/TrucksDashboard";

function Page() {
  return (
    <AppShell title="Trucks">
      <TrucksDashboard />
    </AppShell>
  );
}

export default protectFleetPage(Page);
