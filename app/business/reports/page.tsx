import { AppShell } from "@/components/AppShell";
import { ReportsDashboard } from "@/components/reports/ReportsDashboard";

export default function Page() {
  return (
    <AppShell title="Reports">
      <ReportsDashboard />
    </AppShell>
  );
}
