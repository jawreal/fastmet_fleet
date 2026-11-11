export interface BookingOption {
  label: string;
  value: string;
}

// Replace these option lists with API data when booking persistence is added.
export const locationOptions: BookingOption[] = [
  { label: "Valenzuela Gateway Complex (Valenzuela)", value: "valenzuelaGateway" },
  { label: "BGC retail dock (BGC, Taguig)", value: "bgcRetailDock" },
  { label: "Port of Manila (Manila)", value: "manilaPort" },
  { label: "Balintawak warehouse (Quezon City)", value: "balintawakWarehouse" },
  { label: "Laguna Technopark (Biñan, Laguna)", value: "lagunaTechnopark" },
];

export const vehicleTypeOptions: BookingOption[] = [
  { label: "10W Wing Van", value: "10wWingVan" },
  { label: "6W Closed Van", value: "6wClosedVan" },
  { label: "4W Closed Van", value: "4wClosedVan" },
  { label: "L300 FB Van", value: "l300FbVan" },
];

export const paymentOptions: BookingOption[] = [
  { label: "Cash on delivery", value: "cashOnDelivery" },
  { label: "Bank / e-wallet transfer", value: "bankTransfer" },
  { label: "On account (collect later)", value: "onAccount" },
];

export const vehicleOptions: BookingOption[] = [
  { label: "Assign later", value: "unassigned" },
  { label: "NDA 7183 · 10W Wing Van", value: "nda7183" },
  { label: "NBC 4522 · 6W Closed Van", value: "nbc4522" },
  { label: "CAR 9056 · 6W Closed Van", value: "car9056" },
];
