import { AppShell } from "@/components/AppShell";
import { EarningsDashboard } from "@/components/earnings/EarningsDashboard";

export default function Page() {
  return (
    <AppShell title="Earnings & payouts">
      <EarningsDashboard />
    </AppShell>
  );
}
