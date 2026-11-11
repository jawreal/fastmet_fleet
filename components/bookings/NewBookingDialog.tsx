"use client";

import { useId, useState, type SubmitEvent } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/Textarea";
import {
  locationOptions,
  paymentOptions,
  vehicleOptions,
  vehicleTypeOptions,
  type BookingOption,
} from "./BookingMockData";

interface BookingSelectProps {
  name: string;
  label: string;
  options: BookingOption[];
  placeholder: string;
  description?: string;
}

function BookingSelect({
  name,
  label,
  options,
  placeholder,
  description,
}: Readonly<BookingSelectProps>) {
  const id = useId();
  const descriptionId = `${id}-description`;

  return (
    <div className="grid min-w-0 content-start gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select name={name} items={options}>
        <SelectTrigger
          id={id}
          className="w-full"
          aria-describedby={description ? descriptionId : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

export function NewBookingDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreviewNotice, setShowPreviewNotice] = useState(false);
  const formId = useId();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    // Validate native fields, but do not imply that this UI prototype saves data.
    setShowPreviewNotice(true);
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    setShowPreviewNotice(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" />}>
        <PlusIcon data-icon="inline-start" />
        New booking
      </DialogTrigger>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 px-5 pb-4 pt-5">
          <DialogTitle className="pr-6 text-lg">New direct booking</DialogTitle>
          <DialogDescription className="mt-2 rounded-md bg-muted p-3">
            For customers who book with you directly. FastMet marketplace
            requests arrive under Requests on their own.
          </DialogDescription>
        </DialogHeader>

        {/* Only the form body scrolls; the title and actions remain visible. */}
        <form
          id={formId}
          onSubmit={handleSubmit}
          className="grid min-h-0 gap-4 overflow-y-auto px-5 pb-5"
        >
          <div className="grid gap-2">
            <Label htmlFor={`${formId}-customer`}>
              Customer or company{" "}
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </Label>      
            <Input
              id={`${formId}-customer`}
              name="customer"
              required
              autoComplete="organization"
              placeholder="e.g. Acme Trading"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor={`${formId}-contact`}>Contact person</Label>
              <Input
                id={`${formId}-contact`}
                name="contactPerson"
                autoComplete="name"
                placeholder="e.g. Juan dela Cruz"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${formId}-phone`}>Phone</Label>
              <Input
                id={`${formId}-phone`}
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="0917 000 0000"
              />
            </div>
            <BookingSelect
              name="vehicleType"
              label="Vehicle type"
              options={vehicleTypeOptions}
              placeholder="Select vehicle type"
            />
            <div className="grid gap-2">
              <Label htmlFor={`${formId}-pickupTime`}>
                Pickup date and time{" "}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </Label>
              <Input
                id={`${formId}-pickupTime`}
                name="pickupTime"
                type="datetime-local"
                required
              />
            </div>
            <BookingSelect
              name="pickupPoint"
              label="Pickup point"
              options={locationOptions}
              placeholder="Select pickup point"
            />
            <BookingSelect
              name="dropOffPoint"
              label="Drop-off point"
              options={locationOptions}
              placeholder="Select drop-off point"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`${formId}-cargo`}>Cargo</Label>
            <Input
              id={`${formId}-cargo`}
              name="cargo"
              placeholder="e.g. 6 pallets beverages, ~4,000 kg"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid content-start gap-2">
              <Label htmlFor={`${formId}-helpers`}>Helpers</Label>
              <Input
                id={`${formId}-helpers`}
                name="helpers"
                type="number"
                min={0}
                step={1}
                defaultValue={0}
                placeholder="e.g. 2"
              />
            </div>
            <BookingSelect
              name="payment"
              label="Payment"
              options={paymentOptions}
              placeholder="Select payment method"
            />
            <div className="grid content-start gap-2">
              <Label htmlFor={`${formId}-fare`}>Fare (₱)</Label>
              <Input
                id={`${formId}-fare`}
                name="fare"
                type="number"
                min={0}
                step="0.01"
                placeholder="e.g. 13130.00"
                aria-describedby={`${formId}-fareHint`}
              />
              <p
                id={`${formId}-fareHint`}
                className="text-xs text-muted-foreground"
              >
                Sample fare ₱13,130 for about 24.2 km.
              </p>
            </div>
            <BookingSelect
              name="vehicle"
              label="Vehicle"
              options={vehicleOptions}
              placeholder="Select vehicle"
              description="Its assigned driver gets the trip."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`${formId}-notes`}>Notes for the driver</Label>
            <Textarea
              id={`${formId}-notes`}
              name="notes"
              placeholder="e.g. Call the contact person upon arrival"
              className="min-h-20 resize-y"
            />
          </div>
          {showPreviewNotice && (
            <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              This is a UI preview. Your booking has not been saved.
            </p>
          )}
        </form>

        <DialogFooter className="shrink-0 border-t bg-muted/20 px-5 py-3">
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancel
          </DialogClose>
          <Button type="submit" form={formId}>
            Save booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
