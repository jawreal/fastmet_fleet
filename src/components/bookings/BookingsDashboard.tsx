"use client";
import { useState } from "react";
import { CircleHelp, ClipboardList, Plus } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableSearch } from "@/components/TableSearch";
import { cn } from "@/lib/utils";
import { filterTableRows } from "@/lib/tableSearch";
import {
  bookingStatuses,
  sampleBookings,
  type Booking,
  type BookingStatus,
  type BookingOffer,
} from "@/lib/bookingData";
import { BookingCard } from "./BookingCard";
import { BookingDetailsSheet } from "./BookingDetailsSheet";
import { BookingOfferDialog } from "./BookingOfferDialog";
import { DirectBookingDialog } from "./DirectBookingDialog";

const steps = [
  "Customer posts a request",
  "You offer a vehicle and price",
  "Customer accepts your offer",
  "Driver receives the trip",
];

export function BookingsDashboard() {
  /*TAKE_NOTE: MOCK UP */
  const [bookings, setBookings] = useState(sampleBookings);
  const [directOpen, setDirectOpen] = useState(false);
  const [status, setStatus] = useState<BookingStatus>("Open requests");
  const [query, setQuery] = useState("");
  const [details, setDetails] = useState<Booking | null>(null);
  const [offering, setOffering] = useState<Booking | null>(null);
  const rows = filterTableRows(
    bookings.filter((booking) => booking.status === status),
    query,
    (booking) => [
      booking.id,
      booking.customer,
      booking.pickup,
      booking.pickupArea,
      booking.destination,
      booking.destinationArea,
      booking.vehicleType,
    ],
  );

  /*TAKE_NOTE: MOCK UP */
  function passBooking(id: string) {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id
          ? { ...booking, status: "Not won · cancelled" }
          : booking,
      ),
    );
  }

  /*TAKE_NOTE: MOCK UP */
  function saveOffer(id: string, offer: BookingOffer) {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id
          ? {
              ...booking,
              status: "Offers sent",
              offer: offer.price,
              offerDetails: offer,
            }
          : booking,
      ),
    );
    setStatus("Offers sent");
  }

  return (
    <div className="@container flex flex-col gap-5">
      {/* ------ Page header --------- */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
        <p className="text-sm text-muted-foreground">
          Offer on FastMet requests and manage accepted trips.
        </p>
      </header>
      {/* ------ Booking status tabs --------- */}
      <fieldset className="m-0 min-w-0 max-w-full self-start border-0 p-0">
        <legend className="sr-only">Booking status</legend>
        <div className="flex max-w-full overflow-x-auto border-b">
          {bookingStatuses.map((item) => (
            <Button
              key={item}
              variant="ghost"
              aria-pressed={status === item}
              onClick={() => setStatus(item)}
              className={cn(
                "h-8 shrink-0 rounded-none rounded-t-md border-0 border-b-2 border-transparent px-3 text-muted-foreground active:not-aria-[haspopup]:translate-y-0",
                status === item &&
                  "border-primary bg-primary/10 text-yellow-600 hover:bg-primary/15 hover:text-primary",
              )}
            >
              {item}
              <Badge
                variant="secondary"
                className="ml-1 h-4 rounded-sm px-1 text-[10px] tabular-nums"
              >
                {bookings.filter((booking) => booking.status === item).length}
              </Badge>
            </Button>
          ))}
        </div>
      </fieldset>
      {/* ------ Request search and cards --------- */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TableSearch
          label="Search bookings"
          placeholder="Search booking, customer or location…"
          value={query}
          onValueChange={setQuery}
        />
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {rows.length} {rows.length === 1 ? "booking" : "bookings"}
          </span>
          <Popover>
            <PopoverTrigger render={<Button type="button" variant="outline" />}>
              <CircleHelp aria-hidden="true" />
              How it works
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-56 max-w-[calc(100vw-2rem)]"
            >
              <p className="font-medium">How bookings work</p>
              <ul className="space-y-2 text-muted-foreground">
                {steps.map((step) => (
                  <li key={step} className="flex gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground"
                    />
                    {step}
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
          <Button onClick={() => setDirectOpen(true)}>
            <Plus />
            Direct booking
          </Button>
        </div>
      </div>
      {rows.length ? (
        <div className="grid gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
          {rows.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onDetails={setDetails}
              onPass={passBooking}
              onOffer={setOffering}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-60 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
          <ClipboardList className="size-6 text-muted-foreground" />
          <h2 className="text-sm font-medium">No matching bookings</h2>
          <p className="text-xs text-muted-foreground">
            Try another search or booking status.
          </p>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Sample requests. Offers and passed requests update this preview only;
        nothing is sent to customers.
      </p>
      {/* ------ Details sheet and offer dialog --------- */}
      {directOpen && (
        <DirectBookingDialog
          onClose={() => setDirectOpen(false)}
          onSave={(booking) => {
            setBookings((current) => [booking, ...current]);
            setStatus("Scheduled");
            setQuery("");
          }}
        />
      )}
      {details && (
        <BookingDetailsSheet
          booking={details}
          onPass={passBooking}
          onOffer={setOffering}
          onClose={() => setDetails(null)}
        />
      )}
      {offering && (
        <BookingOfferDialog
          booking={offering}
          onOffer={saveOffer}
          onClose={() => setOffering(null)}
        />
      )}
    </div>
  );
}
