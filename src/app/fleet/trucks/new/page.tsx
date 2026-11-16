import { AppShell } from "@/components/AppShell";
import { AddVehicleForm } from "@/components/trucks/add/AddVehicleForm";
export default function Page() {
  return (
    <AppShell title="Add vehicle">
      <AddVehicleForm />
    </AppShell>
  );
}
