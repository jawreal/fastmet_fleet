import { protectFleetPage } from "@/lib/auth/server/protectPage";
import { AppShell } from "@/components/AppShell";

function Page() {
  return <AppShell title="Live tracking" />;
}

export default protectFleetPage(Page);
