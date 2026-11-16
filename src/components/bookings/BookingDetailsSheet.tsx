import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RouteStop } from "./BookingCard";
import { formatBookingPrice, type Booking } from "@/lib/bookingData";

type BookingDetailsSheetProps = {
  booking: Booking;
  onClose: () => void;
  onPass: (id: string) => void;
  onOffer: (booking: Booking) => void;
};

type FactsProps = { items: { label: string; value: string }[] };

function Facts({ items }: Readonly<FactsProps>) {
  return (
    <dl className="grid grid-cols-2 gap-4 text-xs">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-[10px] tracking-wide text-muted-foreground uppercase">
            {item.label}
          </dt>
          <dd className="mt-1 font-medium">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function BookingDetailsSheet({
  booking,
  onClose,
  onPass,
  onOffer,
}: Readonly<BookingDetailsSheetProps>) {
  const direct = booking.directDetails;
  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
        <SheetHeader className="shrink-0 border-b p-5 pr-12">
          <SheetTitle>{booking.id}</SheetTitle>
          <SheetDescription className="sr-only">
            Booking details for {booking.customer}
          </SheetDescription>
          <div className="flex gap-2">
            <Badge variant="secondary">{booking.status}</Badge>
            <Badge variant="outline">
              {direct ? "Direct booking" : "FastMet marketplace"}
            </Badge>
          </div>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* ------ Route and pickup --------- */}
          <section className="space-y-5 p-5">
            <RouteStop name={booking.pickup} area={booking.pickupArea} />
            <RouteStop
              destination
              name={booking.destination}
              area={booking.destinationArea}
            />
            <Facts
              items={[
                { label: "Pickup time", value: booking.date },
                { label: "Distance", value: booking.distance + " km" },
                { label: "Vehicle type", value: booking.vehicleType },
              ]}
            />
          </section>
          {/* ------ Customer and cargo --------- */}
          <section className="space-y-3 border-t p-5">
            <h3 className="text-xs font-semibold">Customer and cargo</h3>
            <Facts
              items={[
                { label: "Account", value: booking.customer },
                { label: "Contact", value: direct?.contact || "Not provided" },
                {
                  label: "Phone",
                  value: direct?.phone || "Shown after the customer accepts",
                },
                { label: "Cargo", value: booking.cargo || "Not specified" },
                {
                  label: "Helpers requested",
                  value: direct ? String(direct.helpers) : "Not specified",
                },
              ]}
            />
            {direct?.notes && (
              <p className="rounded-md bg-muted/40 p-3 text-xs">
                {direct.notes}
              </p>
            )}
          </section>
          {/* ------ Pricing --------- */}
          <section className="space-y-3 border-t p-5">
            <h3 className="text-xs font-semibold">Customer’s price</h3>
            <dl className="space-y-3 border-t pt-3 text-xs">
              <div className="flex justify-between font-medium">
                <dt>Customer’s price</dt>
                <dd>{formatBookingPrice(booking.price)}</dd>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <dt>Per km</dt>
                <dd>
                  {formatBookingPrice(booking.price / booking.distance)}/km
                </dd>
              </div>
            </dl>
            <p className="text-xs/relaxed text-muted-foreground">
              {booking.payment}. You keep the whole fare. Offer this price or
              your own; the customer decides.
            </p>
          </section>
          {/* ------ Timeline --------- */}
          <section className="space-y-3 border-t p-5">
            <h3 className="text-xs font-semibold">Timeline</h3>
            <div className="flex gap-3 text-xs">
              <span
                aria-hidden="true"
                className="mt-1 size-2 shrink-0 rounded-full bg-emerald-500"
              />
              <div>
                <p className="font-medium">
                  {direct
                    ? "Direct booking created"
                    : "Customer posted booking"}
                </p>
                <p className="mt-1 text-muted-foreground">
                  Posting time not available in this sample.
                </p>
              </div>
            </div>
          </section>
        </div>
        {booking.status === "Open requests" && (
          <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t bg-muted/20 p-4">
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => {
                onPass(booking.id);
                onClose();
              }}
            >
              Pass
            </Button>
            <Button
              onClick={() => {
                onClose();
                onOffer(booking);
              }}
            >
              Make offer
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
