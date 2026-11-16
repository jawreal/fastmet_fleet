import { AppShell } from "@/components/AppShell";
import { DriversHelpers } from "@/components/crew/DriversHelpers";

export default function Page() {
  return (
    <AppShell title="Drivers & helpers">
      <DriversHelpers />
    </AppShell>
  );
}
