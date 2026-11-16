"use client";
import { useState, type SubmitEvent } from "react";
import { format } from "date-fns";
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
import { sampleTrucks } from "@/lib/truckData";
import type { Booking } from "@/lib/bookingData";

type DirectBookingDialogProps = {
  onSave: (booking: Booking) => void;
  onClose: () => void;
};

type BookingSelectProps = {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

function BookingSelect({
  id,
  label,
  value,
  options,
  onChange,
}: Readonly<BookingSelectProps>) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value}
        onValueChange={(next) => {
          if (next !== null) onChange(next);
        }}
        items={options.map((item) => ({ value: item, label: item }))}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
export function DirectBookingDialog({
  onSave,
  onClose,
}: Readonly<DirectBookingDialogProps>) {
  const [vehicleType, setVehicleType] = useState("10W Wing Van");
  const [vehicle, setVehicle] = useState("Assign later");
  const [payment, setPayment] = useState("Cash on delivery");
  const [error, setError] = useState("");

  /*TAKE_NOTE: MOCK UP */
  const vehicles = sampleTrucks.filter(
    (truck) => truck.type === vehicleType && truck.status !== "In maintenance",
  );

  function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => {
      const value = data.get(name);
      return typeof value === "string" ? value.trim() : "";
    };
    const pickup = text("pickupAt");
    const date = new Date(pickup);
    const fare = Number(text("fare"));
    const distance = Number(text("distance"));
    if (
      !pickup ||
      !Number.isFinite(date.getTime()) ||
      !text("customer") ||
      !text("pickup") ||
      !text("destination") ||
      !Number.isFinite(fare) ||
      fare <= 0 ||
      !Number.isFinite(distance) ||
      distance <= 0
    ) {
      setError(
        "Enter customer, pickup, drop-off, pickup date, positive distance and fare.",
      );
      return;
    }
    onSave({
      id: "DIRECT-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
      customer: text("customer"),
      vehicleType,
      pickup: text("pickup"),
      pickupArea: text("pickup"),
      destination: text("destination"),
      destinationArea: text("destination"),
      date: format(date, "MMM d, yyyy") + " · " + pickup.slice(11, 16),
      pickupDate: format(date, "yyyy-MM-dd"),
      pickupTime: text("time"),
      distance,
      payment,
      cargo: text("cargo"),
      price: fare,
      status: "Scheduled",
      directDetails: {
        contact: text("contact"),
        phone: text("phone"),
        helpers: Number(text("helpers") || 0),
        plate: vehicle === "Assign later" ? "" : vehicle,
        notes: text("notes"),
      },
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
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="px-5 pt-5 pr-12">
          <DialogTitle className="text-base">New direct booking</DialogTitle>
          <DialogDescription>
            For customers who book with you directly. Marketplace requests
            arrive separately.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={save}>
          <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="direct-customer">Customer or company *</Label>
              <Input
                id="direct-customer"
                name="customer"
                placeholder="Customer or company name"
                required
              />
            </div>
            {[
              ["contact", "Contact person", "Full name"],
              ["phone", "Phone", "0917 000 0000"],
            ].map(([id, label, placeholder]) => (
              <div key={id} className="grid gap-1.5">
                <Label htmlFor={"direct-" + id}>{label}</Label>
                <Input
                  id={"direct-" + id}
                  name={id}
                  type={id === "phone" ? "tel" : "text"}
                  placeholder={placeholder}
                />
              </div>
            ))}
            <BookingSelect
              id="direct-type"
              label="Vehicle type"
              value={vehicleType}
              options={[
                "10W Wing Van",
                "6W Forward",
                "4W Closed Van",
                "L300 FB Van",
              ]}
              onChange={(value) => {
                setVehicleType(value);
                setVehicle("Assign later");
              }}
            />
            <div className="grid gap-1.5">
              <Label htmlFor="direct-pickup-at">Pickup date and time *</Label>
              <Input
                id="direct-pickup-at"
                name="pickupAt"
                type="datetime-local"
                required
              />
            </div>
            {[
              ["pickup", "Pickup point", "Pickup address"],
              ["destination", "Drop-off point", "Delivery address"],
              ["cargo", "Cargo", "e.g. 6 pallets beverages, approx. 4,000 kg"],
            ].map(([id, label, placeholder]) => (
              <div key={id} className="grid gap-1.5">
                <Label htmlFor={"direct-" + id}>
                  {label}
                  {id !== "cargo" ? " *" : ""}
                </Label>
                <Input
                  id={"direct-" + id}
                  name={id}
                  placeholder={placeholder}
                  required={id !== "cargo"}
                />
              </div>
            ))}
            <div className="grid gap-1.5">
              <Label htmlFor="direct-helpers">Helpers</Label>
              <Input
                id="direct-helpers"
                name="helpers"
                type="number"
                min="0"
                step="1"
                defaultValue="0"
              />
            </div>
            <BookingSelect
              id="direct-payment"
              label="Payment"
              value={payment}
              options={["Cash on delivery", "Paid in app", "Invoice (weekly)"]}
              onChange={setPayment}
            />
            <div className="grid gap-1.5">
              <Label htmlFor="direct-distance">Distance (km) *</Label>
              <Input
                id="direct-distance"
                name="distance"
                type="number"
                min="0.1"
                step="0.1"
                placeholder="e.g. 24.2"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="direct-fare">Fare (₱) *</Label>
              <Input
                id="direct-fare"
                name="fare"
                type="number"
                min="1"
                step="0.01"
                placeholder="Agreed fare"
                required
              />
            </div>
            <div className="space-y-1.5">
              <BookingSelect
                id="direct-vehicle"
                label="Vehicle"
                value={vehicle}
                options={[
                  "Assign later",
                  ...vehicles.map((truck) => truck.plate),
                ]}
                onChange={setVehicle}
              />
              <p className="text-[10px] text-muted-foreground">
                Its assigned driver receives the trip.
              </p>
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="direct-notes">Notes for the driver</Label>
              <Textarea
                id="direct-notes"
                name="notes"
                placeholder="Loading instructions or delivery requirements"
              />
            </div>
            <p className="text-[10px] text-muted-foreground sm:col-span-2">
              Preview only. Saved bookings remain in this session; nothing is
              dispatched.
            </p>
            {error && (
              <p
                role="alert"
                className="text-xs text-destructive sm:col-span-2"
              >
                {error}
              </p>
            )}
          </div>
          <DialogFooter className="border-t bg-muted/20 px-5 py-3">
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit">Save booking</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
