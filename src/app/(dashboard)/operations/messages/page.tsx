import { protectFleetPage } from "@/lib/auth/server/protectPage";
import { AppShell } from "@/components/AppShell";
import { MessagesDashboard } from "@/components/messages/MessagesDashboard";

function Page() {
  return (
    <AppShell title="Messages">
      <MessagesDashboard />
    </AppShell>
  );
}

export default protectFleetPage(Page);
