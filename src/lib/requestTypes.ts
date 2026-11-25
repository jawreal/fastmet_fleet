import type { CrewMember } from "@/lib/crewData";
import type { FleetTruck } from "@/lib/truckData";

// Mirror the client's SelectedVehicle names without importing React Native dependencies.
// Missing catalog values stay null: a wheel label must never masquerade as a real refCode.
export interface RequestVehicleType {
  key: string | null;
  refCode: string | null;
  name: string;
}
// Plate is the fleet vehicle identity. The sidebar projects one optional crew assignment.
export type Vehicle = Pick<FleetTruck, "plate" | "model"> & {
  vehicleType: RequestVehicleType;
  // The crew model supplies duty labels separately from the truck's mechanical status.
  status: CrewMember["status"];
  driver: Pick<CrewMember, "id" | "name"> | null;
};

export interface RequestSummary {
  id: string;
  bookingRef: string;
  vehicleType: RequestVehicleType;
  pickup: string;
  dropoff: string;
  pickupAt: string;
  expiresAt: string;
  customerPrice: number;
  distanceKm?: number;
}

export interface VehicleSection {
  vehicle: Vehicle;
  requests: RequestSummary[];
}

// Group identity uses the client's key when known, otherwise the exact fleet type label.
export const vehicleTypeId = (type: RequestVehicleType) =>
  type.key ?? type.name;
// Reuse actual fleet labels when a live refCode is unavailable; do not fabricate codes.
export const vehicleTypeLabel = (type: RequestVehicleType) =>
  type.refCode ?? type.name.split(" ")[0];

export function compareRequestExpiry(
  first: RequestSummary,
  second: RequestSummary,
) {
  return Date.parse(first.expiresAt) - Date.parse(second.expiresAt);
}

/**
 * Build one section per on-duty or on-trip vehicle, with requests ordered by expiry.
 * Each eligible vehicle can show the same request of its type. Inputs are never mutated.
 */
export function selectVehicleSections(
  vehicles: readonly Vehicle[],
  requests: readonly RequestSummary[],
): VehicleSection[] {
  const requestsByType = new Map<string, RequestSummary[]>();
  const seen = new Set<string>();

  // Index each request ID once, then reuse the sorted type list across matching vehicles.
  for (const request of requests.toSorted(compareRequestExpiry)) {
    if (seen.has(request.id)) continue;
    seen.add(request.id);
    const key = vehicleTypeId(request.vehicleType);
    const matching = requestsByType.get(key);
    if (matching) matching.push(request);
    else requestsByType.set(key, [request]);
  }

  return vehicles
    .filter((vehicle) => vehicle.status !== "Off duty")
    .map((vehicle) => ({
      vehicle,
      requests: requestsByType.get(vehicleTypeId(vehicle.vehicleType)) ?? [],
    }))
    .sort((a, b) => {
      const first = a.requests[0];
      const second = b.requests[0];
      if (!first) return second ? 1 : 0;
      if (!second) return -1;
      return compareRequestExpiry(first, second);
    });
}

/**
 * Count distinct request IDs across all visible vehicle sections.
 * The same request contributes one to the global badge, regardless of how many vehicles show it.
 */
export function selectUniqueRequestCount(
  sections: readonly VehicleSection[],
): number {
  const ids = new Set<string>();
  for (const section of sections) {
    for (const request of section.requests) ids.add(request.id);
  }
  return ids.size;
}
