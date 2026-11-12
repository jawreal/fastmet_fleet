import { AppShell } from "@/components/AppShell";
import { MaintenanceDashboard } from "@/components/maintenance/MaintenanceDashboard";

export default function Page() {
  return (
    <AppShell title="Maintenance">
      <MaintenanceDashboard />
    </AppShell>
  );
}
