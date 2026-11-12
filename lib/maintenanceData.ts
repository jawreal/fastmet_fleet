export const maintenanceToday = "2026-11-12";
export const serviceKinds = [
  "PMS",
  "Change oil",
  "Tires",
  "Brakes",
  "Brake overhaul",
  "Aircon repair",
  "Battery",
  "Engine repair",
  "Body repair",
  "Registration renewal",
  "Insurance renewal",
  "Other",
];

export type MaintenanceTruck = {
  plate: string;
  model: string;
  odometer: number;
  nextPms: number;
  interval: number;
};
export type ScheduledService = {
  id: string;
  plate: string;
  kind: string;
  cost: number;
  dueDate: string;
  dueKm: number | null;
  shop: string;
  notes: string;
};
export type CompletedService = {
  id: string;
  plate: string;
  kind: string;
  date: string;
  odometer: number;
  cost: number;
  shop: string;
  notes: string;
};
export const maintenanceTrucks: MaintenanceTruck[] = [
  {
    plate: "NDA 7183",
    model: "Isuzu Giga Wing Van",
    odometer: 126480,
    nextPms: 130300,
    interval: 10000,
  },
  {
    plate: "NBC 4522",
    model: "Isuzu Forward",
    odometer: 88215,
    nextPms: 89900,
    interval: 7500,
  },
  {
    plate: "CAR 9056",
    model: "Hino 500 Dropside",
    odometer: 94620,
    nextPms: 94900,
    interval: 7500,
  },
  {
    plate: "NEX 3317",
    model: "Isuzu Elf Closed Van",
    odometer: 41870,
    nextPms: 45100,
    interval: 5000,
  },
  {
    plate: "DAB 2149",
    model: "Mitsubishi Fuso Canter",
    odometer: 153900,
    nextPms: 155200,
    interval: 5000,
  },
  {
    plate: "NFQ 6640",
    model: "Mitsubishi L300 FB",
    odometer: 18350,
    nextPms: 20200,
    interval: 5000,
  },
  {
    plate: "NGH 5408",
    model: "Isuzu QKR Closed Van",
    odometer: 65120,
    nextPms: 67000,
    interval: 5000,
  },
];
export const initialScheduledServices: ScheduledService[] = [
  {
    id: "service-1",
    plate: "DAB 2149",
    kind: "Brake overhaul",
    cost: 14500,
    dueDate: "2026-11-12",
    dueKm: null,
    shop: "Malinta Truck Service Center",
    notes: "In the shop since yesterday. Rear drums and linings.",
  },
  {
    id: "service-2",
    plate: "CAR 9056",
    kind: "PMS",
    cost: 13000,
    dueDate: "",
    dueKm: 94900,
    shop: "Hino service, Valenzuela",
    notes: "7,500 km PMS",
  },
  {
    id: "service-3",
    plate: "NBC 4522",
    kind: "Tires",
    cost: 38000,
    dueDate: "2026-11-23",
    dueKm: null,
    shop: "Gulod Tire Center",
    notes: "Replace 4 rear tires",
  },
  {
    id: "service-4",
    plate: "NFQ 6640",
    kind: "Insurance renewal",
    cost: 9800,
    dueDate: "2026-11-24",
    dueKm: null,
    shop: "",
    notes: "Comprehensive policy",
  },
  {
    id: "service-5",
    plate: "NDA 7183",
    kind: "Registration renewal",
    cost: 21000,
    dueDate: "2026-12-03",
    dueKm: null,
    shop: "LTO Valenzuela",
    notes: "OR/CR renewal with emission test",
  },
];
export const initialServiceHistory: CompletedService[] = [
  {
    id: "history-1",
    date: "2026-10-31",
    plate: "NEX 3317",
    kind: "PMS",
    odometer: 40100,
    cost: 4200,
    shop: "Isuzu Valenzuela",
    notes: "",
  },
  {
    id: "history-2",
    date: "2026-10-23",
    plate: "CAR 9056",
    kind: "Aircon repair",
    odometer: 93100,
    cost: 6500,
    shop: "Cool Ride Auto Aircon",
    notes: "",
  },
  {
    id: "history-3",
    date: "2026-10-15",
    plate: "NDA 7183",
    kind: "PMS",
    odometer: 120300,
    cost: 18500,
    shop: "Isuzu Valenzuela",
    notes: "",
  },
  {
    id: "history-4",
    date: "2026-10-08",
    plate: "NBC 4522",
    kind: "PMS",
    odometer: 82400,
    cost: 12800,
    shop: "Isuzu Valenzuela",
    notes: "",
  },
  {
    id: "history-5",
    date: "2026-10-03",
    plate: "NFQ 6640",
    kind: "PMS",
    odometer: 15200,
    cost: 3800,
    shop: "Mitsubishi Malabon",
    notes: "",
  },
];
export const formatMaintenancePesos = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
export const formatMaintenanceDate = (value: string) =>
  new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(`${value}T12:00:00+08:00`));
export function getServiceStatus(
  service: ScheduledService,
  truck: MaintenanceTruck,
): "Overdue" | "Due soon" | "Scheduled" {
  const days = service.dueDate
    ? (Date.parse(service.dueDate) - Date.parse(maintenanceToday)) / 86400000
    : null;
  const km = service.dueKm === null ? null : service.dueKm - truck.odometer;
  if ((days !== null && days < 0) || (km !== null && km < 0)) return "Overdue";
  if ((days !== null && days <= 7) || (km !== null && km <= 500))
    return "Due soon";
  return "Scheduled";
}
export function readMaintenanceText(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === "string" ? value.trim() : "";
}
