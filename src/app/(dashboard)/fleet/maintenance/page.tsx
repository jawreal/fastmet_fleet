import { protectFleetPage } from "@/lib/auth/server/protectPage";
import { AppShell } from "@/components/AppShell";
import { MaintenanceDashboard } from "@/components/maintenance/MaintenanceDashboard";

function Page() {
  return (
    <AppShell title="Maintenance">
      <MaintenanceDashboard />
    </AppShell>
  );
}

export default protectFleetPage(Page);
