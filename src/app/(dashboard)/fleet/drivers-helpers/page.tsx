import { protectFleetPage } from "@/lib/auth/server/protectPage";
import { AppShell } from "@/components/AppShell";
import { DriversHelpers } from "@/components/crew/DriversHelpers";

function Page() {
  return (
    <AppShell title="Drivers & helpers">
      <DriversHelpers />
    </AppShell>
  );
}

export default protectFleetPage(Page);
