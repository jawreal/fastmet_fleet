"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { formatPesos } from "@/lib/reportData";
import type { VehicleSlot } from "../../lib/SubscriptionData";

interface ReleaseSlotDialogProps {
  slot: VehicleSlot;
  onClose: () => void;
}

// Demo trip count only; real release eligibility must come from booking data.
const mockScheduledTrips: Record<string, number> = { "NDA 7183": 1 };

export function ReleaseSlotDialog({
  slot,
  onClose,
}: Readonly<ReleaseSlotDialogProps>) {
  const [showPreviewNotice, setShowPreviewNotice] = useState(false);
  const scheduledTrips = mockScheduledTrips[slot.plate] ?? 0;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle className="pr-6 text-base">Release slot</DialogTitle>
          <DialogDescription className="pt-2 text-foreground">
            Release the subscription slot for <strong>{slot.plate}</strong>? It
            stops getting FastMet bookings right away.
            {scheduledTrips > 0 &&
              ` It still has ${scheduledTrips} scheduled or active trip; reassign it first.`}
            {slot.deposit !== null
              ? ` The ${formatPesos(slot.deposit)} deposit is refunded to your wallet after FastMet checks the account.`
              : " No deposit is held for this slot."}{" "}
            Unused days aren&apos;t refunded.
          </DialogDescription>
        </DialogHeader>
        {showPreviewNotice && (
          <p className="mx-5 rounded-md bg-muted p-3 text-xs text-muted-foreground">
            This is a UI preview. The slot has not been released and no refund
            was issued.
          </p>
        )}
        <DialogFooter className="border-t bg-muted/20 px-5 py-3">
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowPreviewNotice(true)}
          >
            Release slot
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
