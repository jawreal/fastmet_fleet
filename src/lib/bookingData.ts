export const bookingStatuses = [
  "Open requests",
  "Offers sent",
  "Scheduled",
  "On the road",
  "Completed",
  "Not won · cancelled",
] as const;
export type BookingStatus = (typeof bookingStatuses)[number];
export type Booking = {
  id: string;
  customer: string;
  vehicleType: string;
  pickup: string;
  pickupArea: string;
  destination: string;
  destinationArea: string;
  date: string;
  distance: number;
  payment: string;
  cargo: string;
  price: number;
  status: BookingStatus;
  pickupDate?: string;
  pickupTime?: string;
  directDetails?: {
    contact: string;
    phone: string;
    helpers: number;
    plate: string;
    notes: string;
  };
  offer?: number;
  offerDetails?: BookingOffer;
};
export const formatBookingPrice = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
/*TAKE_NOTE: MOCK UP */
export const sampleBookings: Booking[] = [
  {
    id: "FM-261110-1001",
    customer: "North Harbor Trading",
    vehicleType: "10W Wing Van",
    pickup: "Manila North Harbor, Pier 4",
    pickupArea: "Tondo, Manila",
    destination: "Antipolo construction site",
    destinationArea: "Antipolo, Rizal",
    date: "Nov 10, 2026 · 8:00 AM",
    distance: 30.5,
    payment: "Invoice (weekly)",
    cargo: "Canned goods, 14 pallets · 1 helper",
    price: 14280,
    status: "Open requests",
  },
  {
    id: "FM-261110-1002",
    customer: "Alabang Home Supply",
    vehicleType: "4W Closed Van",
    pickup: "Alabang supply depot",
    pickupArea: "Alabang, Muntinlupa",
    destination: "Ortigas Ext. hardware depot",
    destinationArea: "Cainta, Rizal",
    date: "Nov 10, 2026 · 10:30 AM",
    distance: 26.7,
    payment: "Paid in app",
    cargo: "Furniture set, 2 sofas + tables",
    price: 3720,
    status: "Open requests",
  },
  {
    id: "FM-261109-9432",
    customer: "Gateway Logistics",
    vehicleType: "10W Wing Van",
    pickup: "Port Area",
    pickupArea: "Manila",
    destination: "Meycauayan warehouse",
    destinationArea: "Meycauayan, Bulacan",
    date: "Nov 9, 2026 · 1:00 PM",
    distance: 32,
    payment: "Paid in app",
    cargo: "General merchandise · 6 pallets",
    price: 13300,
    status: "On the road",
  },
];

export type BookingOffer = {
  price: number;
  plate: string;
  arrival: string;
  note: string;
};
