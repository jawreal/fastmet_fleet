export interface SubscriptionPlan {
  name: string;
  monthlyPrice: number;
  regularPrice: number;
  deposit: number;
  vehicles: string;
}

export interface VehicleSlot {
  plate: string;
  vehicleType: string;
  plan: string;
  monthlyPrice: number;
  deposit: number | null;
  renewalDate: string;
  status: "Active" | "Expired" | "No slot";
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    name: "Motorcycle",
    monthlyPrice: 100,
    regularPrice: 500,
    deposit: 500,
    vehicles: "Motorcycle",
  },
  {
    name: "Sedan to L300",
    monthlyPrice: 200,
    regularPrice: 1000,
    deposit: 1000,
    vehicles: "Sedan, L300 FB Van",
  },
  {
    name: "Truck",
    monthlyPrice: 300,
    regularPrice: 1500,
    deposit: 1500,
    vehicles: "4W Closed Van, 6W Forward, 10W Wing Van",
  },
];

// Fixed demo dates keep the reference stable until billing data is connected.
export const vehicleSlots: VehicleSlot[] = [
  {
    plate: "NEX 3317",
    vehicleType: "4W",
    plan: "Truck",
    monthlyPrice: 300,
    deposit: 1500,
    renewalDate: "2026-09-30",
    status: "Expired",
  },
  {
    plate: "NGH 5408",
    vehicleType: "4W",
    plan: "Truck",
    monthlyPrice: 300,
    deposit: null,
    renewalDate: "",
    status: "No slot",
  },
  {
    plate: "CAR 9056",
    vehicleType: "6W",
    plan: "Truck",
    monthlyPrice: 300,
    deposit: 1500,
    renewalDate: "2026-11-13",
    status: "Active",
  },
  {
    plate: "NDA 7183",
    vehicleType: "10W",
    plan: "Truck",
    monthlyPrice: 300,
    deposit: 1500,
    renewalDate: "2026-11-20",
    status: "Active",
  },
  {
    plate: "NBC 4522",
    vehicleType: "6W",
    plan: "Truck",
    monthlyPrice: 300,
    deposit: 1500,
    renewalDate: "2026-11-24",
    status: "Active",
  },
  {
    plate: "DAB 2149",
    vehicleType: "4W",
    plan: "Truck",
    monthlyPrice: 300,
    deposit: 1500,
    renewalDate: "2026-12-02",
    status: "Active",
  },
  {
    plate: "NFQ 6640",
    vehicleType: "L300",
    plan: "Sedan to L300",
    monthlyPrice: 200,
    deposit: 1000,
    renewalDate: "2026-12-05",
    status: "Active",
  },
];

export function formatRenewalDate(date: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(`${date}T00:00:00+08:00`));
}
