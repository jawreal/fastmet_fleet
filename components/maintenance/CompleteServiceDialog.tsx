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
import { Textarea } from "@/components/ui/Textarea";
import {
  maintenanceToday,
  readMaintenanceText,
  type MaintenanceTruck,
  type ScheduledService,
  type CompletedService,
} from "@/lib/maintenanceData";

type CompleteServiceDialogProps = {
  service: ScheduledService;
  truck: MaintenanceTruck;
  onComplete: (entry: CompletedService) => void;
  onClose: () => void;
};
export function CompleteServiceDialog({
  service,
  truck,
  onComplete,
  onClose,
}: Readonly<CompleteServiceDialogProps>) {
  const [error, setError] = useState("");
  function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const date = readMaintenanceText(data, "date");
    const odometer = Number(
      readMaintenanceText(data, "odometer") || Number.NaN,
    );
    const cost = Number(readMaintenanceText(data, "cost") || 0);
    if (
      !date ||
      !Number.isFinite(Date.parse(date)) ||
      date > maintenanceToday ||
      !Number.isSafeInteger(odometer) ||
      odometer < truck.odometer ||
      !Number.isFinite(cost) ||
      cost < 0
    ) {
      setError(
        `Use a valid completion date, a non-negative cost and an odometer reading of at least ${truck.odometer.toLocaleString("en-PH")} km.`,
      );
      return;
    }
    onComplete({
      id: service.id,
      plate: service.plate,
      kind: service.kind,
      date,
      odometer,
      cost,
      shop: readMaintenanceText(data, "shop"),
      notes: readMaintenanceText(data, "notes"),
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
          <DialogTitle>Complete: {service.kind}</DialogTitle>
          <DialogDescription>
            {truck.plate} · {truck.model}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="complete-date">Date done</Label>
              <Input
                id="complete-date"
                name="date"
                type="date"
                defaultValue={maintenanceToday}
                max={maintenanceToday}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="complete-km">Odometer (km)</Label>
              <Input
                id="complete-km"
                placeholder="Total mileage on the dashboard"
                name="odometer"
                type="number"
                min={truck.odometer}
                step={1}
                defaultValue={truck.odometer}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="complete-cost">Actual cost (₱)</Label>
              <Input
                id="complete-cost"
                placeholder="e.g. 14500"
                name="cost"
                type="number"
                min={0}
                step="0.01"
                defaultValue={service.cost}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="complete-shop">Shop</Label>
              <Input
                id="complete-shop"
                placeholder="Shop name and location"
                name="shop"
                defaultValue={service.shop}
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="complete-notes">Work done</Label>
              <Textarea
                id="complete-notes"
                placeholder="Describe the work completed and parts replaced"
                name="notes"
                defaultValue={service.notes}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            This moves the service to history. Completing PMS also resets the
            next PMS mileage.
          </p>
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit">Mark done</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
