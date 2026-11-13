import { AppShell } from "@/components/AppShell";
import { TrucksDashboard } from "@/components/trucks/TrucksDashboard";

export default function Page() {
  return (
    <AppShell title="Trucks">
      <TrucksDashboard />
    </AppShell>
  );
}
