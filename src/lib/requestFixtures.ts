// This is the only source of request data for the UI preview. No API or business rules live here.
export type RequestSummary = {
  id: string;
  vehicleCode: string;
  vehicleName: string;
  pickup: string;
  dropoff: string;
  pickupAt: string;
  expiresAt: string;
  customerPrice: number;
  distanceKm: number;
};
export type FixtureCount = 0 | 2 | 7 | 120;
export const fixtureCounts: FixtureCount[] = [0, 2, 7, 120];
// A fixed epoch produces identical server/client HTML. The preview rebases dates after mount.
export const fixtureEpoch = Date.UTC(2030, 0, 1, 0, 0);
// Field meanings follow fastmet/types/book.ts and the client RequestCard: selectedVehicle.name,
// formatted pickUp/dropOff, bookingType.value, routeData.totalPrice, and routeData.distance.
// Rail codes and request expiry are explicit preview values: the client booking shape does
// not provide a general request-expiry field. Reschedule-confirmation expiry is unrelated.
const routes = [
  {
    vehicleCode: "10W",
    vehicleName: "10W Wing Van",
    pickup: "Tondo, Manila",
    dropoff: "Antipolo, Rizal",
    customerPrice: 6800,
    distanceKm: 36.4,
  },
  {
    vehicleCode: "4W",
    vehicleName: "4W Closed Van",
    pickup: "Malinta, Valenzuela",
    dropoff: "Pasig, Metro Manila",
    customerPrice: 3400,
    distanceKm: 28.2,
  },
  {
    vehicleCode: "6W",
    vehicleName: "6W Forward Truck",
    pickup: "Meycauayan, Bulacan",
    dropoff: "Calamba, Laguna",
    customerPrice: 9200,
    distanceKm: 82.5,
  },
  {
    vehicleCode: "4W",
    vehicleName: "4W Closed Van",
    pickup: "Baclaran, Parañaque",
    dropoff: "Bacoor, Cavite",
    customerPrice: 2800,
    distanceKm: 19.8,
  },
];
// Reverse fixture order deliberately proves that the UI sorts by expiry rather than arrival.
export function getRequestFixture(
  count: FixtureCount,
  epoch = fixtureEpoch,
): RequestSummary[] {
  return Array.from({ length: count }, (_, index) => ({
    ...routes[index % routes.length],
    id: `preview-request-${index + 1}`,
    pickupAt: new Date(epoch + (index + 1) * 3_600_000).toISOString(),
    expiresAt: new Date(epoch + (12 + index * 4) * 60_000).toISOString(),
  })).reverse();
}
// Simulation also comes from this file, so the preview never invents data inside a component.
export function getSimulatedRequest(
  epoch: number,
  sequence: number,
): RequestSummary {
  return {
    ...routes[1],
    id: `preview-new-${sequence}`,
    pickupAt: new Date(epoch + 7_200_000).toISOString(),
    expiresAt: new Date(epoch + 8 * 60_000).toISOString(),
  };
}
