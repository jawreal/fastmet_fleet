"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileImageSettings } from "./ProfileImageSettings";

/*TAKE_NOTE: MOCK UP */
export function CompanySettings() {
  return (
    <Card aria-labelledby="company-heading" className="@container min-w-0">
      <CardHeader>
        <CardTitle id="company-heading">Company</CardTitle>
        <CardDescription>
          Shown on bookings, receipts, and dispatch messages.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <ProfileImageSettings />
        <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="companyName">
              Company name{" "}
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </Label>
            <Input
              id="companyName"
              name="companyName"
              autoComplete="organization"
              defaultValue="Bayani Trucking Services"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dispatchPhone">Dispatch phone</Label>
            <Input
              id="dispatchPhone"
              name="dispatchPhone"
              type="tel"
              autoComplete="tel"
              defaultValue="0917 555 0142"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="garageAddress">Garage address</Label>
            <Input
              id="garageAddress"
              name="garageAddress"
              autoComplete="street-address"
              defaultValue="Km 14 MacArthur Hwy, Malinta, Valenzuela City"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="companyEmail">Company email</Label>
            <Input
              id="companyEmail"
              name="companyEmail"
              type="email"
              autoComplete="email"
              defaultValue="dispatch@bayanitrucking.example"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto justify-end border-t">
        <Button type="button" size="lg">
          Save company details
        </Button>
      </CardFooter>
    </Card>
  );
}
