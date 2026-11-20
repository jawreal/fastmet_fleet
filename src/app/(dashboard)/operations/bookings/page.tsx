import { AppShell } from "@/components/AppShell";
import { BookingsDashboard } from "@/components/bookings/BookingsDashboard";

export default function Page() {
  return (
    <AppShell title="Bookings">
      <BookingsDashboard />
    </AppShell>
  );
}
