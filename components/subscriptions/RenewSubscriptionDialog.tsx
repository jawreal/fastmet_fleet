"use client";

import { useId, useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPesos } from "@/lib/reportData";
import {
  subscriptionPlans,
  type VehicleSlot,
} from "../../lib/pubscriptionData";

interface RenewSubscriptionDialogProps {
  slots: VehicleSlot[];
  onClose: () => void;
}

const monthOptions = [1, 3, 6, 12].map((months) => ({
  label: `${months} ${months === 1 ? "month" : "months"}`,
  value: String(months),
}));

function getRenewalEndDate(slot: VehicleSlot, months: number): string {
  // Use Philippine calendar dates and clamp month-end dates (e.g. Jan 31 → Feb 28).
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const start = slot.renewalDate > today ? slot.renewalDate : today;
  const [year, month, day] = start.split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(target);
}

export function RenewSubscriptionDialog({
  slots,
  onClose,
}: Readonly<RenewSubscriptionDialogProps>) {
  const [months, setMonths] = useState(1);
  const [notice, setNotice] = useState("");
  const periodId = useId();
  const walletBalance = 51000;
  const subscriptionTotal = slots.reduce(
    (total, slot) => total + slot.monthlyPrice * months,
    0,
  );
  const depositTotal = slots.reduce((total, slot) => {
    const plan = subscriptionPlans.find((plan) => plan.name === slot.plan);
    return total + (slot.deposit === null ? (plan?.deposit ?? 0) : 0);
  }, 0);
  const total = subscriptionTotal + depositTotal;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle className="pr-6 text-base">
            {slots.length === 1
              ? `Renew ${slots[0].plate}`
              : `Renew ${slots.length} vehicle slots`}
          </DialogTitle>
          <DialogDescription>
            Choose how many months to renew from your wallet.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 px-5">
          <div className="grid gap-2">
            <Label htmlFor={periodId}>Pay for</Label>
            <Select
              value={String(months)}
              items={monthOptions}
              onValueChange={(value) => {
                if (value) {
                  setMonths(Number(value));
                  setNotice("");
                }
              }}
            >
              <SelectTrigger id={periodId} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <dl className="space-y-3 text-xs/relaxed">
            {slots.map((slot) => (
              <div key={slot.plate} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">
                  {slot.plate} · {slot.plan} · to{" "}
                  {getRenewalEndDate(slot, months)}
                </dt>
                <dd className="shrink-0 font-medium tabular-nums">
                  {formatPesos(slot.monthlyPrice * months)}
                </dd>
              </div>
            ))}
            {depositTotal > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">
                  One-time refundable deposit
                </dt>
                <dd className="font-medium tabular-nums">
                  {formatPesos(depositTotal)}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-4 border-t pt-3 font-semibold">
              <dt>Total from wallet</dt>
              <dd className="tabular-nums">{formatPesos(total)}</dd>
            </div>
          </dl>
          <div className="space-y-1 text-xs/relaxed text-muted-foreground">
            <p>Wallet balance: {formatPesos(walletBalance)}</p>
            <p>
              Paid from your FastMet wallet at 80% off the regular rate. The
              deposit is charged once per vehicle and refunded when you release
              the slot.
            </p>
          </div>
          {notice && (
            <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              {notice}
            </p>
          )}
        </div>
        <DialogFooter className="border-t bg-muted/20 px-5 py-3">
          <Button
            type="button"
            variant="outline"
            className="sm:mr-auto"
            onClick={() =>
              setNotice(
                "Adding money is a UI preview. Your wallet balance has not changed.",
              )
            }
          >
            Add money
          </Button>
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            type="button"
            disabled={total > walletBalance}
            onClick={() =>
              setNotice(
                "This is a UI preview. No payment was made and no subscriptions were renewed.",
              )
            }
          >
            Pay and renew
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
