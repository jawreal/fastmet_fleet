export interface FuelTruck {
  plate: string;
  type: string;
  driver: string;
  typical: number;
}
export interface FillUp {
  id: string;
  date: string;
  plate: string;
  driver: string;
  liters: number;
  price: number;
  odometer: number;
  station: string;
}
export const fuelTrucks: FuelTruck[] = [
  { plate: "NDA 7183", type: "10W", driver: "Rodel Santos", typical: 3 },
  { plate: "NBC 4522", type: "6W", driver: "Jun Dela Cruz", typical: 4.5 },
  { plate: "CAR 9056", type: "6W", driver: "Arnel Bautista", typical: 4.5 },
  { plate: "NEX 3317", type: "4W", driver: "Mark Villanueva", typical: 7 },
  { plate: "DAB 2149", type: "4W", driver: "Ramil Garcia", typical: 7 },
  { plate: "NFQ 6640", type: "L300", driver: "Jessie Ramos", typical: 9 },
  { plate: "NGH 5408", type: "4W", driver: "Christian Flores", typical: 7 },
];
const seed: [string, number, number, number, number, string][] = [
  ["2026-11-11", 2, 89, 61.25, 94482, "Shell, NLEX Balintawak"],
  ["2026-11-10", 0, 141, 61.04, 126350, "Petron, MacArthur Hwy"],
  ["2026-11-10", 1, 65, 61.32, 88159, "Caltex, C-5 Libis"],
  ["2026-11-10", 3, 38, 61.71, 41769, "Caltex, C-5 Libis"],
  ["2026-11-10", 5, 28, 61.9, 18221, "Petron, MacArthur Hwy"],
  ["2026-11-08", 4, 34, 61.93, 153797, "Petron, MacArthur Hwy"],
  ["2026-11-06", 0, 134, 61.59, 125894, "Seaoil, Malinta"],
  ["2026-11-06", 2, 72, 61.01, 94117, "Caltex, C-5 Libis"],
  ["2026-11-05", 1, 63, 61.7, 87855, "Seaoil, Malinta"],
  ["2026-11-05", 3, 40, 61.3, 41525, "Petron, SLEX Bicutan"],
  ["2026-11-05", 5, 31, 61.79, 17980, "Caltex, C-5 Libis"],
  ["2026-11-02", 4, 41, 61.43, 153551, "Shell, NLEX Balintawak"],
];
export const initialFillUps: FillUp[] = seed.map(
  ([date, truck, liters, price, odometer, station], index) => ({
    id: `fuel-${index}`,
    date,
    plate: fuelTrucks[truck].plate,
    driver: fuelTrucks[truck].driver,
    liters,
    price,
    odometer,
    station,
  }),
);
export const formatFuelPesos = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);

export function getFuelEconomy(entries: FillUp[]) {
  const sorted = [...entries].sort(
    (a, b) => a.date.localeCompare(b.date) || a.odometer - b.odometer,
  );
  let distance = 0;
  let liters = 0;
  for (let index = 1; index < sorted.length; index++) {
    const traveled = sorted[index].odometer - sorted[index - 1].odometer;
    if (traveled > 0) {
      distance += traveled;
      liters += sorted[index].liters;
    }
  }
  return {
    distance,
    economy: liters > 0 ? distance / liters : null,
    measuredLiters: liters,
  };
}
