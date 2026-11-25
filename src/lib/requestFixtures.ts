import { sampleTrucks } from "@/lib/truckData";
import { sampleCrew } from "@/lib/crewData";
import type {
  RequestSummary,
  RequestVehicleType,
  Vehicle,
} from "@/lib/requestTypes";

// All synthetic requests and unit variations are defined here, never inside UI components.
export const scenarios = [
  "mixed",
  "same-type",
  "many-requests",
  "no-driver",
  "none-on-duty",
  "empty",
  "stress",
] as const;
export type RequestScenario = (typeof scenarios)[number];
export const fixtureEpoch = Date.UTC(2030, 0, 1);
// Only MC/L3 are documented in the client source. The other live refCodes are not available.
const types: RequestVehicleType[] = [
  { key: null, refCode: null, name: "6W Forward" },
  { key: "closed_van", refCode: null, name: "4W Closed Van" },
  { key: "l300", refCode: "L3", name: "L300 FB Van" },
  { key: "wing_van", refCode: null, name: "10W Wing Van" },
  { key: "motorcycle", refCode: "MC", name: "Motorcycle" },
];
// Join the fleet plate to the single assigned driver, then project the crew duty status.
const fleetVehicles: Vehicle[] = sampleTrucks.map((truck) => {
  const crew = sampleCrew.find(
    (member) => member.id === truck.driverId && member.role === "Driver",
  );
  return {
    plate: truck.plate,
    model: truck.model,
    vehicleType: types.find((type) => type.name === truck.type)!,
    status: crew?.status ?? "Off duty",
    driver: crew ? { id: crew.id, name: crew.name } : null,
  };
});
const routes = [
  {
    pickup: "Tondo, Manila",
    dropoff: "Antipolo, Rizal",
    customerPrice: 6800,
    distanceKm: 36.4,
  },
  {
    pickup: "Malinta, Valenzuela",
    dropoff: "Pasig, Metro Manila",
    customerPrice: 3400,
    distanceKm: 28.2,
  },
  {
    pickup: "Meycauayan, Bulacan",
    dropoff: "Calamba, Laguna",
    customerPrice: 9200,
    distanceKm: 82.5,
  },
  // Extra mock routes keep a busy preview varied without introducing live requests.
  {
    pickup: "Novaliches, Quezon City",
    dropoff: "Santa Rosa, Laguna",
    customerPrice: 7400,
    distanceKm: 63.8,
  },
  {
    pickup: "Binondo, Manila",
    dropoff: "Taytay, Rizal",
    customerPrice: 4100,
    distanceKm: 29.6,
  },
  {
    pickup: "Marilao, Bulacan",
    dropoff: "Makati, Metro Manila",
    customerPrice: 5300,
    distanceKm: 43.2,
  },
  {
    pickup: "Bacoor, Cavite",
    dropoff: "Taguig, Metro Manila",
    customerPrice: 3900,
    distanceKm: 25.7,
  },
  {
    pickup: "Marikina, Metro Manila",
    dropoff: "San Pedro, Laguna",
    customerPrice: 6200,
    distanceKm: 51.4,
  },
];
// Expiry is explicitly synthetic; the client only exposes unrelated reschedule expiry.
function request(
  vehicleType: RequestVehicleType,
  index: number,
  epoch: number,
): RequestSummary {
  return {
    ...routes[index % routes.length],
    id: `preview-${vehicleType.key ?? vehicleType.name}-${index}`,
    bookingRef: `FM-261120-${String(index + 1001)}`,
    vehicleType,
    pickupAt: new Date(epoch + (index + 1) * 3_600_000).toISOString(),
    expiresAt: new Date(epoch + (12 + index * 4) * 60_000).toISOString(),
  };
}
// Additional fictional driver names avoid repeated identities in the larger DEMO roster.
const previewDriverNames = [
  ...sampleCrew
    .filter((member) => member.role === "Driver")
    .map((member) => member.name),
  "Paolo Mendoza",
  "Luis Navarro",
  "Miguel Aquino",
  "Carlo Soriano",
  "Adrian Flores",
];
// Demo plates and driver IDs distinguish synthetic assignments from the fleet fixture.
function demoVehicle(index: number): Vehicle {
  const vehicleType = types[index % types.length];
  return {
    plate: `DEMO-${String(index + 1).padStart(3, "0")}`,
    model: "",
    vehicleType,
    driver: {
      id: `preview-driver-${index}`,
      name: previewDriverNames[index],
    },
    status: index % 3 === 0 ? "On trip" : "On duty",
  };
}

export function getRequestFixture(
  scenario: RequestScenario,
  epoch = fixtureEpoch,
): { vehicles: Vehicle[]; requests: RequestSummary[] } {
  // Production always gets the mixed fixture. Alternate datasets are development previews.
  if (process.env.NODE_ENV === "development") {
    switch (scenario) {
      case "empty":
        return { vehicles: [], requests: [] };
      case "none-on-duty":
        return {
          vehicles: [fleetVehicles[4]],
          requests: Array.from({ length: 3 }, (_, i) =>
            request(types[1], i, epoch),
          ),
        };
      case "no-driver":
        return {
          // Explicit mock duty status makes the missing-driver row visible for review.
          vehicles: [{ ...fleetVehicles[6], status: "On duty" }],
          requests: [],
        };
      case "same-type":
        return {
          vehicles: [
            fleetVehicles[1],
            { ...fleetVehicles[2], status: "On duty" },
          ],
          requests: [request(types[0], 1, epoch), request(types[0], 0, epoch)],
        };
      case "many-requests":
        return {
          vehicles: [fleetVehicles[1]],
          requests: Array.from({ length: 8 }, (_, i) =>
            request(types[0], i, epoch),
          ),
        };
      case "stress":
        return {
          vehicles: Array.from({ length: 12 }, (_, i) => demoVehicle(i)),
          requests: Array.from({ length: 120 }, (_, i) =>
            request(types[i % types.length], i, epoch),
          ).reverse(),
        };
    }
  }

  // Three distinct types with two, one and zero requests. The closed van stays on trip.
  return {
    vehicles: [fleetVehicles[1], fleetVehicles[3], fleetVehicles[5]],
    requests: [
      request(types[0], 0, epoch),
      request(types[0], 1, epoch),
      request(types[1], 2, epoch),
    ],
  };
}
// Simulated arrivals remain fixtures and never mutate a unit's duty or assignment.
export function getSimulatedRequest(
  epoch: number,
  sequence: number,
  vehicleType: RequestVehicleType = types[0],
): RequestSummary {
  return {
    ...request(vehicleType, sequence, epoch),
    id: `preview-new-${sequence}`,
    bookingRef: `FM-DEMO-${String(sequence).padStart(4, "0")}`,
    expiresAt: new Date(epoch + 8 * 60_000).toISOString(),
  };
}
