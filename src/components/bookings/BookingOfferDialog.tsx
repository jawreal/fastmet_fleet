"use client";
import { useState, type SubmitEvent } from "react";
import { UserRound, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import {
  formatBookingPrice,
  type Booking,
  type BookingOffer,
} from "@/lib/bookingData";
import { sampleTrucks } from "@/lib/truckData";
import { sampleCrew } from "@/lib/crewData";
import { getNumberCoding } from "@/lib/truckDetailsData";

type BookingOfferDialogProps = {
  booking: Booking;
  onOffer: (id: string, offer: BookingOffer) => void;
  onClose: () => void;
};

const arrivalOptions = ["On time", "Within 30 minutes", "Within 1 hour"];

export function BookingOfferDialog({
  booking,
  onOffer,
  onClose,
}: Readonly<BookingOfferDialogProps>) {
  /*TAKE_NOTE: MOCK UP */
  const vehicles = sampleTrucks.filter(
    (truck) => truck.type === booking.vehicleType,
  );
  const [plate, setPlate] = useState(vehicles[0]?.plate ?? "");
  const [arrival, setArrival] = useState(arrivalOptions[0]);
  const [price, setPrice] = useState(String(booking.price));
  const truck = vehicles.find((vehicle) => vehicle.plate === plate);
  const driver = sampleCrew.find((person) => person.id === truck?.driverId);
  const helper = sampleCrew.find((person) => person.id === truck?.helperId);
  const numericPrice = Number(price);
  const canOffer = Boolean(
    truck &&
    driver &&
    truck.status !== "In maintenance" &&
    Number.isFinite(numericPrice) &&
    numericPrice > 0,
  );

  /*TAKE_NOTE: MOCK UP */
  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canOffer) return;
    const note = new FormData(event.currentTarget).get("note");
    onOffer(booking.id, {
      price: numericPrice,
      plate,
      arrival,
      note: typeof note === "string" ? note.trim() : "",
    });
    onClose();
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle className="text-base">Make an offer</DialogTitle>
          <DialogDescription className="sr-only">
            Choose a vehicle and enter your offer for {booking.id}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit}>
          <div className="space-y-4 px-5 pb-5">
            {/* ------ Request summary --------- */}
            <div className="space-y-1 rounded-md bg-muted/50 p-3 text-xs/relaxed text-muted-foreground">
              <p>
                <strong className="font-medium text-foreground">
                  {booking.id}
                </strong>{" "}
                · {booking.vehicleType} · pickup {booking.date}
              </p>
              <p>
                {booking.pickupArea} → {booking.destinationArea} ·{" "}
                {booking.distance} km · customer’s price{" "}
                {formatBookingPrice(booking.price)}
              </p>
            </div>
            {/* ------ Offer fields --------- */}
            <div className="grid gap-1.5">
              <Label htmlFor="offer-vehicle">Vehicle to offer *</Label>
              <Select
                value={plate}
                onValueChange={(value) => value && setPlate(value)}
                items={vehicles.map((vehicle) => ({
                  value: vehicle.plate,
                  label:
                    vehicle.plate +
                    " · " +
                    (sampleCrew.find((person) => person.id === vehicle.driverId)
                      ?.name ?? "No driver") +
                    " · " +
                    vehicle.status,
                }))}
              >
                <SelectTrigger id="offer-vehicle" className="w-full">
                  <SelectValue placeholder="Select a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.plate} value={vehicle.plate}>
                      {vehicle.plate} ·{" "}
                      {sampleCrew.find(
                        (person) => person.id === vehicle.driverId,
                      )?.name ?? "No driver"}{" "}
                      · {vehicle.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!vehicles.length && (
                <p className="text-xs text-destructive">
                  No matching vehicles in your fleet.
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="offer-price">Your price (₱) *</Label>
                <Input
                  id="offer-price"
                  name="price"
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">
                  You keep the full{" "}
                  {formatBookingPrice(
                    Number.isFinite(numericPrice) ? numericPrice : 0,
                  )}
                  . No commission.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="offer-arrival">Can arrive at pickup</Label>
                <Select
                  value={arrival}
                  onValueChange={(value) => value && setArrival(value)}
                  items={arrivalOptions.map((value) => ({
                    value,
                    label: value,
                  }))}
                >
                  <SelectTrigger id="offer-arrival" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {arrivalOptions.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="offer-note">Note to customer (optional)</Label>
              <Textarea
                id="offer-note"
                name="note"
                placeholder="e.g. Wing van with tarps, 2 helpers available"
                maxLength={1000}
              />
            </div>
            {/* ------ Assigned crew and warnings --------- */}
            {truck && (
              <div className="space-y-2 rounded-md bg-muted/50 p-3 text-xs">
                <p className="flex items-center gap-2">
                  <UserRound className="size-3.5 text-muted-foreground" />
                  Driver:{" "}
                  <strong className="font-medium">
                    {driver?.name ?? "Not assigned"}
                  </strong>
                  {driver && " · " + driver.phone}
                </p>
                <p className="flex items-center gap-2">
                  <UserRound className="size-3.5 text-muted-foreground" />
                  Helper:{" "}
                  <strong className="font-medium">
                    {helper?.name ?? "No helper"}
                  </strong>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Assigned to {truck.plate} in Trucks › Driver assignments.
                </p>
              </div>
            )}
            {truck && (
              <div className="flex gap-2 rounded-md border border-primary/20 bg-primary/5 p-3 text-xs/relaxed">
                <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-yellow-700 dark:text-primary" />
                <div>
                  <p>
                    Number coding: {getNumberCoding(truck.plate)}. Check the
                    pickup schedule before offering.
                  </p>
                  {truck.status === "On trip" && (
                    <p>
                      This vehicle is currently on a trip. Confirm its
                      availability for pickup.
                    </p>
                  )}
                  {truck.status === "In maintenance" && (
                    <p>This vehicle cannot be offered while in maintenance.</p>
                  )}
                  {!driver && <p>Assign a driver before making an offer.</p>}
                </div>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground">
              Preview only. No offer is sent to the customer.
            </p>
          </div>
          <DialogFooter className="border-t bg-muted/20 px-5 py-3">
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!canOffer}>
              Send offer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
