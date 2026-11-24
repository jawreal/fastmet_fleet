import { protectFleetPage } from "@/lib/auth/server/protectPage";
import { AppShell } from "@/components/AppShell";
import { AddVehicleForm } from "@/components/trucks/add/AddVehicleForm";
function Page() {
  return (
    <AppShell title="Add vehicle">
      <AddVehicleForm />
    </AppShell>
  );
}

export default protectFleetPage(Page);
