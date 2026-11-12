"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const pesos = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
const vehicles = [
  {
    value: "6w",
    label: "6W Forward",
    base: 5600,
    perKm: 62,
    efficiency: 4.5,
    subscription: 300,
  },
  {
    value: "4w",
    label: "4W Closed van",
    base: 2800,
    perKm: 38,
    efficiency: 8,
    subscription: 200,
  },
  {
    value: "10w",
    label: "10W Wing van",
    base: 8500,
    perKm: 85,
    efficiency: 3,
    subscription: 500,
  },
];
export function EarningsEstimator() {
  const [vehicle, setVehicle] = useState("6w");
  const [trips, setTrips] = useState("2");
  const [distance, setDistance] = useState("35");
  const [days, setDays] = useState("24");
  const [fuelPrice, setFuelPrice] = useState("61.5");
  const rate = vehicles.find((item) => item.value === vehicle)!;
  const count =
    Math.max(0, Number(trips)) * Math.min(31, Math.max(0, Number(days)));
  const km = Math.max(0, Number(distance));
  const fare = rate.base + rate.perKm * km;
  const gross = fare * count;
  const fuel =
    ((km * 2) / rate.efficiency) * Math.max(0, Number(fuelPrice)) * count;
  const driver = gross * 0.15;
  const fields = [
    {
      id: "trips",
      label: "Trips per day",
      unit: "trips",
      value: trips,
      set: setTrips,
      max: 24,
    },
    {
      id: "distance",
      label: "Average trip distance",
      unit: "km",
      value: distance,
      set: setDistance,
    },
    {
      id: "days",
      label: "Working days / month",
      unit: "days",
      value: days,
      set: setDays,
      max: 31,
    },
    {
      id: "fuel",
      label: "Fuel price",
      unit: "₱/L",
      value: fuelPrice,
      set: setFuelPrice,
    },
  ];
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Earnings estimator</CardTitle>
          <Badge variant="secondary">Per vehicle</Badge>
        </div>
        <CardDescription>Plan your monthly take-home earnings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-1.5">
          <Label htmlFor="estimate-vehicle">Vehicle type</Label>
          <Select
            value={vehicle}
            onValueChange={(value) => value && setVehicle(value)}
            items={vehicles}
          >
            <SelectTrigger id="estimate-vehicle" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {fields.map((field) => (
            <div key={field.id} className="grid gap-1.5">
              <Label htmlFor={`estimate-${field.id}`}>{field.label}</Label>
              <div className="relative">
                <Input
                  id={`estimate-${field.id}`}
                  type="number"
                  min={0}
                  max={field.max}
                  step={field.id === "fuel" ? "0.1" : "1"}
                  value={field.value}
                  onChange={(event) => field.set(event.target.value)}
                  className="pr-12"
                />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {field.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
        <dl className="space-y-2 border-t pt-3 tabular-nums">
          {[
            ["Fare per trip", fare],
            [`Monthly fares · ${count} trips`, gross],
            ["Vehicle subscription", -rate.subscription],
            ["Fuel · round trip", -fuel],
            ["Driver pay · 15%", -driver],
          ].map(([label, amount]) => (
            <div key={label} className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-medium">{pesos(Number(amount))}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
      <CardFooter className="mt-auto flex-col items-stretch gap-2 border-t">
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium">Estimated monthly profit</span>
          <output
            aria-live="polite"
            className="text-lg font-semibold tracking-tight tabular-nums"
          >
            {pesos(gross - rate.subscription - fuel - driver)}
          </output>
        </div>
        <p className="text-muted-foreground">
          Sample rates with a promotional subscription. Excludes tolls, helpers,
          maintenance, insurance and deposit.
        </p>
      </CardFooter>
    </Card>
  );
}
