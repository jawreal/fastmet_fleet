import type { FleetTruck } from "@/lib/truckData";
import { getTruckProfile } from "@/lib/truckDetailsData";
import {
  initialScheduledServices,
  initialServiceHistory,
  maintenanceTrucks,
} from "@/lib/maintenanceData";
import { initialFillUps, getFuelEconomy } from "@/lib/fuelData";

/*TAKE_NOTE: MOCK UP */
// Prepare the sheet's sample data here so sections only receive their own inputs.
export function getTruckDetailsView(truck: FleetTruck) {
  const profile = getTruckProfile(truck.plate);
  const history = initialServiceHistory.filter(
    (entry) => entry.plate === truck.plate,
  );
  const scheduled = initialScheduledServices.filter(
    (entry) => entry.plate === truck.plate,
  );
  const fills = initialFillUps.filter((entry) => entry.plate === truck.plate);
  const interval = maintenanceTrucks.find(
    (item) => item.plate === truck.plate,
  )!.interval;
  const remaining = truck.nextPms - truck.odometer;

  return {
    profile,
    history,
    scheduled,
    metrics: {
      trips: profile.trips.length,
      earnings: profile.trips.reduce((sum, trip) => sum + trip.fare, 0),
      fuelSpend: fills.reduce(
        (sum, entry) => sum + entry.liters * entry.price,
        0,
      ),
      economy: getFuelEconomy(fills).economy,
    },
    maintenance: {
      nextPms: truck.nextPms,
      remaining,
      interval,
      usage: Math.min(100, Math.max(0, 1 - remaining / interval) * 100),
      lastPms: history.find((entry) => entry.kind === "PMS"),
    },
  };
}
