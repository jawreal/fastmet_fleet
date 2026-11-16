"use client";

import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { fuelTrucks, type FillUp } from "@/lib/fuelData";

type LogFillUpDialogProps = {
  entries: FillUp[];
  onSave: (entry: FillUp) => void;
  onClose: () => void;
};

function getTextField(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function LogFillUpDialog({
  entries,
  onSave,
  onClose,
}: Readonly<LogFillUpDialogProps>) {
  const [plate, setPlate] = useState(fuelTrucks[0].plate);
  const [driver, setDriver] = useState(fuelTrucks[0].driver);
  const [error, setError] = useState("");

  /*TAKE_NOTE: MOCK UP */
  function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const date = getTextField(data, "date");
    const station = getTextField(data, "station");
    const odometer = Number(getTextField(data, "odometer") || Number.NaN);
    const liters = Number(getTextField(data, "liters") || Number.NaN);
    const price = Number(getTextField(data, "price") || Number.NaN);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(date))
    ) {
      setError("Enter a valid fill-up date.");
      return;
    }
    const sameTruck = entries.filter((entry) => entry.plate === plate);
    if (
      sameTruck.some(
        (entry) =>
          (entry.date <= date && entry.odometer >= odometer) ||
          (entry.date > date && entry.odometer <= odometer),
      )
    ) {
      setError(
        "Odometer must fall between the readings before and after this fill-up.",
      );
      return;
    }
    if (
      ![odometer, liters, price].every(Number.isFinite) ||
      odometer < 0 ||
      liters <= 0 ||
      price <= 0
    ) {
      setError("Enter valid odometer, liters and fuel price values.");
      return;
    }
    onSave({
      id: crypto.randomUUID(),
      date,
      plate,
      driver,
      odometer,
      liters,
      price,
      station,
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
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Log fill-up</DialogTitle>
          <DialogDescription>
            Fill up to the brim each time so km/L is accurate. Entries are kept
            for this preview session.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="fuel-truck">Truck</Label>
              <Select
                value={plate}
                items={fuelTrucks.map((truck) => ({
                  value: truck.plate,
                  label: `${truck.plate} · ${truck.type}`,
                }))}
                onValueChange={(value) => {
                  if (value) {
                    setPlate(value);
                    setDriver(
                      fuelTrucks.find((truck) => truck.plate === value)!.driver,
                    );
                    setError("");
                  }
                }}
              >
                <SelectTrigger id="fuel-truck" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fuelTrucks.map((truck) => (
                    <SelectItem key={truck.plate} value={truck.plate}>
                      {truck.plate} · {truck.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="fuel-driver">Driver</Label>
              <Select
                value={driver}
                onValueChange={(value) => value !== null && setDriver(value)}
                items={[
                  { value: "", label: "Unassigned" },
                  ...fuelTrucks.map((truck) => ({
                    value: truck.driver,
                    label: truck.driver,
                  })),
                ]}
              >
                <SelectTrigger id="fuel-driver" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {fuelTrucks.map((truck) => (
                    <SelectItem key={truck.driver} value={truck.driver}>
                      {truck.driver}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="fuel-date">Date</Label>
              <Input
                id="fuel-date"
                name="date"
                type="date"
                defaultValue="2026-11-12"
                max="2026-11-12"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="fuel-odometer">Odometer (km)</Label>
              <Input
                id="fuel-odometer"
                name="odometer"
                type="number"
                min={0}
                step={1}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="fuel-liters">Liters</Label>
              <Input
                id="fuel-liters"
                name="liters"
                type="number"
                min={0.01}
                step={0.01}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="fuel-price">Price per liter (₱)</Label>
              <Input
                id="fuel-price"
                name="price"
                type="number"
                min={0.01}
                step={0.01}
                defaultValue="61.50"
                required
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="fuel-station">Station</Label>
              <Input
                id="fuel-station"
                name="station"
                placeholder="Station name and location"
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit">Save fill-up</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
