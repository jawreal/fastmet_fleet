import { protectFleetPage } from "@/lib/auth/server/protectPage";
import { AppShell } from "@/components/AppShell";
import { ReportsDashboard } from "@/components/reports/ReportsDashboard";

function Page() {
  return (
    <AppShell title="Reports">
      <ReportsDashboard />
    </AppShell>
  );
}

export default protectFleetPage(Page);
