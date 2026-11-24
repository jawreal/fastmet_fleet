import { protectFleetPage } from "@/lib/auth/server/protectPage";
import { AppShell } from "@/components/AppShell";

function Page() {
  return <AppShell title="Overview" />;
}

export default protectFleetPage(Page);
