import { protectFleetPage } from "@/lib/auth/server/protectPage";
import { AppShell } from "@/components/AppShell";
import { BookingsDashboard } from "@/components/bookings/BookingsDashboard";

function Page() {
  return (
    <AppShell title="Bookings">
      <BookingsDashboard />
    </AppShell>
  );
}

export default protectFleetPage(Page);
