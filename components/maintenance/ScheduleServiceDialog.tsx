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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  readMaintenanceText,
  serviceKinds,
  type MaintenanceTruck,
  type ScheduledService,
} from "@/lib/maintenanceData";

type ScheduleServiceDialogProps = {
  trucks: MaintenanceTruck[];
  service?: ScheduledService;
  onSave: (service: ScheduledService) => void;
  onClose: () => void;
};

export function ScheduleServiceDialog({
  trucks,
  service,
  onSave,
  onClose,
}: Readonly<ScheduleServiceDialogProps>) {
  const [plate, setPlate] = useState(service?.plate ?? trucks[0].plate);
  const [kind, setKind] = useState(service?.kind ?? "PMS");
  const [error, setError] = useState("");
  function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const dueDate = readMaintenanceText(data, "dueDate");
    const kmText = readMaintenanceText(data, "dueKm");
    const dueKm = kmText ? Number(kmText) : null;
    const cost = Number(readMaintenanceText(data, "cost") || 0);
    if (!dueDate && dueKm === null) {
      setError("Enter a due date or odometer reading.");
      return;
    }
    if (
      (dueDate && !Number.isFinite(Date.parse(dueDate))) ||
      !Number.isFinite(cost) ||
      cost < 0 ||
      (dueKm !== null && (!Number.isSafeInteger(dueKm) || dueKm < 0))
    ) {
      setError("Enter a valid due date, odometer and estimated cost.");
      return;
    }
    onSave({
      id: service?.id ?? crypto.randomUUID(),
      plate,
      kind,
      cost,
      dueDate,
      dueKm,
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
          <DialogTitle>
            {service ? "Edit service" : "Schedule service"}
          </DialogTitle>
          <DialogDescription>
            Schedule by date, mileage, or both. Changes last for this preview
            session.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="service-truck">Truck</Label>
              <Select
                value={plate}
                onValueChange={(value) => value && setPlate(value)}
                items={trucks.map((truck) => ({
                  value: truck.plate,
                  label: `${truck.plate} · ${truck.model}`,
                }))}
              >
                <SelectTrigger id="service-truck" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {trucks.map((truck) => (
                    <SelectItem key={truck.plate} value={truck.plate}>
                      {truck.plate} · {truck.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="service-kind">Service</Label>
              <Select
                value={kind}
                onValueChange={(value) => value && setKind(value)}
                items={serviceKinds.map((value) => ({ value, label: value }))}
              >
                <SelectTrigger id="service-kind" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {serviceKinds.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="service-cost">Estimated cost (₱)</Label>
              <Input
                id="service-cost"
                placeholder="e.g. 13000"
                name="cost"
                type="number"
                min={0}
                step="0.01"
                defaultValue={service?.cost}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="service-date">Due date</Label>
              <Input
                id="service-date"
                name="dueDate"
                type="date"
                defaultValue={service?.dueDate}
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="service-km">Or due at odometer (km)</Label>
              <Input
                id="service-km"
                placeholder="e.g. 94900"
                name="dueKm"
                type="number"
                min={0}
                step={1}
                defaultValue={service?.dueKm ?? ""}
              />
              <p className="text-xs text-muted-foreground">
                Total mileage shown on the truck’s dashboard.
              </p>
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="service-shop">Shop or service center</Label>
              <Input
                id="service-shop"
                placeholder="Shop name and location"
                name="shop"
                defaultValue={service?.shop}
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="service-notes">Notes</Label>
              <Textarea
                id="service-notes"
                placeholder="Describe the service or parts to replace"
                name="notes"
                defaultValue={service?.notes}
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit">
              {service ? "Save changes" : "Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
