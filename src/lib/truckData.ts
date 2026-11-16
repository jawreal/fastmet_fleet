import { maintenanceTrucks } from "@/lib/maintenanceData";

export type TruckStatus = "Available" | "On trip" | "In maintenance";
export type FleetTruck = {
  plate: string;
  model: string;
  type: string;
  status: TruckStatus;
  driverId: string;
  helperId: string;
  upcomingTrips: number;
  odometer: number;
  nextPms: number;
};

/*TAKE_NOTE: MOCK UP */
const assignments: [string, string, TruckStatus, string, string, number][] = [
  ["NDA 7183", "10W Wing Van", "On trip", "rodel", "noel", 0],
  ["NBC 4522", "6W Forward", "Available", "jun", "bong", 1],
  ["CAR 9056", "6W Forward", "On trip", "arnel", "", 0],
  ["NEX 3317", "4W Closed Van", "On trip", "mark", "", 0],
  ["DAB 2149", "4W Closed Van", "In maintenance", "ramil", "", 0],
  ["NFQ 6640", "L300 FB Van", "Available", "jessie", "", 1],
  ["NGH 5408", "4W Closed Van", "Available", "", "", 0],
];
export const sampleTrucks: FleetTruck[] = assignments.map(
  ([plate, type, status, driverId, helperId, upcomingTrips]) => {
    const truck = maintenanceTrucks.find((item) => item.plate === plate)!;
    return {
      plate,
      type,
      status,
      driverId,
      helperId,
      upcomingTrips,
      model: truck.model,
      odometer: truck.odometer,
      nextPms: truck.nextPms,
    };
  },
);
export const truckFilters = [
  "All statuses",
  "Available",
  "On trip",
  "In maintenance",
  "Needs driver",
] as const;
export type TruckFilter = (typeof truckFilters)[number];
