"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const payoutMethods = [
  { label: "GCash", value: "gcash" },
  { label: "Maya", value: "maya" },
  { label: "Bank transfer", value: "bankTransfer" },
];

export function PayoutsSettings() {
  return (
    <Card aria-labelledby="payouts-heading" className="@container min-w-0">
      <CardHeader>
        <CardTitle id="payouts-heading">Payouts and dispatch</CardTitle>
        <CardDescription>
          Where your earnings go and how trucks get assigned.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-4 @min-[22rem]:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="payoutMethod">Payout method</Label>
            <Select name="payoutMethod" defaultValue="gcash" items={payoutMethods}>
              <SelectTrigger id="payoutMethod" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {payoutMethods.map(({ label, value }) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="accountNumber">Account number</Label>
            <Input id="accountNumber" name="accountNumber" inputMode="numeric" defaultValue="0917 555 0142" />
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border p-3">
          <Checkbox id="numberCodingWarning" name="numberCodingWarning" defaultChecked aria-describedby="numberCodingDescription" className="mt-0.5" />
          <div className="grid gap-1">
            <Label htmlFor="numberCodingWarning" className="leading-relaxed">
              Warn about number coding (UVVRP) when assigning trucks
            </Label>
            <p id="numberCodingDescription" className="text-xs/relaxed text-muted-foreground">
              You&apos;ll see a warning before dispatching a truck that&apos;s restricted that day.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex-col items-start gap-3 border-t @min-[22rem]:flex-row @min-[22rem]:items-center @min-[22rem]:justify-between">
        <p className="text-xs/relaxed text-muted-foreground">
          FastMet takes no commission. Your only cost is the monthly subscription per vehicle.{" "}
          <Link href="/business/subscriptions" className="font-medium text-primary underline-offset-4 hover:underline">
            View subscriptions
          </Link>
        </p>
        <Button type="button" className="self-end" size="lg">Save</Button>
      </CardFooter>
    </Card>
  );
}
