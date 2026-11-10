export const formatPesos = (amount: number) =>
  `${amount < 0 ? "−" : ""}₱${Math.abs(amount).toLocaleString("en-PH")}`;

export interface TruckReportData {
  plate: string;
  type: string;
  trips: number;
  utilization: number;
  fares: number;
  subscription: number;
  fuel: number;
  service: number;
}

export interface CrewReportData {
  name: string;
  role: "Driver" | "Helper";
  trips: number;
  fares: number | null;
  payScheme: string;
  estimatedPay: number;
}

export const truckReports: TruckReportData[] = [
  { plate: "NDA 7183", type: "10W", trips: 1, utilization: 3, fares: 13060, subscription: 300, fuel: 0, service: 18500 },
  { plate: "NBC 4522", type: "6W", trips: 5, utilization: 16, fares: 36120, subscription: 300, fuel: 0, service: 12800 },
  { plate: "CAR 9056", type: "6W", trips: 2, utilization: 6, fares: 17280, subscription: 300, fuel: 0, service: 6500 },
  { plate: "NEX 3317", type: "4W", trips: 1, utilization: 3, fares: 3720, subscription: 0, fuel: 0, service: 4200 },
  { plate: "DAB 2149", type: "4W", trips: 1, utilization: 3, fares: 2890, subscription: 300, fuel: 2205, service: 0 },
  { plate: "NFQ 6640", type: "L300", trips: 0, utilization: 0, fares: 0, subscription: 200, fuel: 0, service: 0 },
  { plate: "NGH 5408", type: "4W", trips: 0, utilization: 0, fares: 0, subscription: 0, fuel: 0, service: 0 },
];

export const crewReports: CrewReportData[] = [
  { name: "Rodel Santos", role: "Driver", trips: 2, fares: 25310, payScheme: "15% of fare", estimatedPay: 3797 },
  { name: "Jun Dela Cruz", role: "Driver", trips: 4, fares: 29440, payScheme: "15% of fare", estimatedPay: 4416 },
  { name: "Arnel Bautista", role: "Driver", trips: 2, fares: 13520, payScheme: "₱1,100 / day", estimatedPay: 2200 },
  { name: "Ramil Garcia", role: "Driver", trips: 1, fares: 3820, payScheme: "₱950 / day", estimatedPay: 950 },
  { name: "Jessie Ramos", role: "Driver", trips: 1, fares: 1550, payScheme: "13% of fare", estimatedPay: 202 },
  { name: "Christian Flores", role: "Driver", trips: 2, fares: 11880, payScheme: "₱900 / day", estimatedPay: 1800 },
  { name: "Noel Aquino", role: "Helper", trips: 1, fares: null, payScheme: "₱650 / day", estimatedPay: 650 },
  { name: "Bong Mercado", role: "Helper", trips: 3, fares: null, payScheme: "₱650 / day", estimatedPay: 1950 },
];
