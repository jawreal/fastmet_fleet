import { AppShell } from "@/components/AppShell";
import { SubscriptionsDashboard } from "@/components/subscriptions/SubscriptionsDashboard";

export default function Page() {
  return (
    <AppShell title="Subscriptions">
      <SubscriptionsDashboard />
    </AppShell>
  );
}
