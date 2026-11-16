import { Circle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { formatBookingPrice, type Booking } from "@/lib/bookingData";

type BookingCardProps = {
  booking: Booking;
  onDetails: (booking: Booking) => void;
  onPass: (id: string) => void;
  onOffer: (booking: Booking) => void;
};

type RouteStopProps = { name: string; area: string; destination?: boolean };

export function RouteStop({
  name,
  area,
  destination,
}: Readonly<RouteStopProps>) {
  return (
    <div className="relative flex gap-3">
      {!destination && (
        <span
          aria-hidden="true"
          className="absolute top-4 -bottom-4 left-1.5 border-l border-dashed border-primary/70"
        />
      )}
      {destination ? (
        <MapPin
          aria-hidden="true"
          className="mt-0.5 size-3.5 shrink-0 text-primary"
        />
      ) : (
        <Circle
          aria-hidden="true"
          className="mt-0.5 size-3.5 shrink-0 text-primary"
        />
      )}
      <div>
        <p className="text-xs font-medium">{name}</p>
        {area && <p className="text-xs text-muted-foreground">{area}</p>}
      </div>
    </div>
  );
}

export function BookingCard({
  booking,
  onDetails,
  onPass,
  onOffer,
}: Readonly<BookingCardProps>) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{booking.vehicleType}</CardTitle>
          <Badge variant="outline" className="font-normal">
            {booking.status === "Open requests" ? "Request" : booking.status}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground">{booking.id}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <RouteStop name={booking.pickup} area={booking.pickupArea} />
          <RouteStop
            destination
            name={booking.destination}
            area={booking.destinationArea}
          />
        </div>
        <dl className="grid grid-cols-2 gap-3 text-xs">
          <div className="col-span-2">
            <dt className="text-muted-foreground">Pickup</dt>
            <dd className="mt-1 font-medium">{booking.date}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Distance</dt>
            <dd className="mt-1 tabular-nums">{booking.distance} km</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Payment</dt>
            <dd className="mt-1">{booking.payment}</dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground">{booking.cargo}</p>
        <div className="flex items-center justify-between gap-3 rounded-md bg-muted/50 p-3">
          <div>
            <p className="text-[10px] text-muted-foreground">
              Customer’s price
            </p>
            <p className="text-xl font-semibold tracking-tight tabular-nums">
              {formatBookingPrice(booking.price)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Per km</p>
            <p className="text-sm font-medium tabular-nums">
              {formatBookingPrice(booking.price / booking.distance)}
            </p>
          </div>
        </div>
        {booking.offer && (
          <p className="text-xs">
            Your offer: <strong>{formatBookingPrice(booking.offer)}</strong>
          </p>
        )}
      </CardContent>
      <CardFooter className="mt-auto justify-end gap-2 border-t">
        {booking.status === "Open requests" && (
          <Button variant="ghost" onClick={() => onPass(booking.id)}>
            Pass
          </Button>
        )}
        <Button variant="outline" onClick={() => onDetails(booking)}>
          Details
        </Button>
        {booking.status === "Open requests" && (
          <Button onClick={() => onOffer(booking)}>Make offer</Button>
        )}
      </CardFooter>
    </Card>
  );
}
