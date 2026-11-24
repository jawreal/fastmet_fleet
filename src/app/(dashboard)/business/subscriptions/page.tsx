import { protectFleetPage } from "@/lib/auth/server/protectPage";
import { AppShell } from "@/components/AppShell";
import { SubscriptionsDashboard } from "@/components/subscriptions/SubscriptionsDashboard";

function Page() {
  return (
    <AppShell title="Subscriptions">
      <SubscriptionsDashboard />
    </AppShell>
  );
}

export default protectFleetPage(Page);
