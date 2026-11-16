import { AppShell } from "@/components/AppShell";
import { MessagesDashboard } from "@/components/messages/MessagesDashboard";

export default function Page() {
  return (
    <AppShell title="Messages">
      <MessagesDashboard />
    </AppShell>
  );
}
