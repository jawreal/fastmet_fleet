"use client";
import { useSyncExternalStore } from "react";
import type { VehicleFile } from "@/lib/vehicleFileData";

/*TAKE_NOTE: MOCK UP */
// Shared session state; replace with company profile data when persistence is connected.
let image: VehicleFile | undefined;
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function setCompanyImage(next: VehicleFile | undefined) {
  image = next;
  listeners.forEach((listener) => listener());
}
export function useCompanyImage() {
  const value = useSyncExternalStore(
    subscribe,
    () => image,
    () => undefined,
  );
  return { image: value, setCompanyImage };
}
