import { protectFleetPage } from "@/lib/auth/server/protectPage";
import { AppShell } from "@/components/AppShell";
import { EarningsDashboard } from "@/components/earnings/EarningsDashboard";

function Page() {
  return (
    <AppShell title="Earnings & payouts">
      <EarningsDashboard />
    </AppShell>
  );
}

export default protectFleetPage(Page);
