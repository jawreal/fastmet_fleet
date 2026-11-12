export interface SubscriptionPayment {
  id: string;
  paidAt: string;
  vehiclePlate: string;
  item: "Subscription, 1 month" | "Vehicle deposit";
  coverageEnd: string | null;
  paymentMethod: "FastMet wallet" | "GCash";
  amount: number;
}

// Fixed demo transactions; timestamps include the Philippine UTC offset.
export const subscriptionPayments: SubscriptionPayment[] = [
  { id: "payment-01", paidAt: "2026-11-04T09:00:00+08:00", vehiclePlate: "NEX 3317", item: "Subscription, 1 month", coverageEnd: "2026-12-04", paymentMethod: "FastMet wallet", amount: 300 },
  { id: "payment-02", paidAt: "2026-10-27T09:00:00+08:00", vehiclePlate: "NDA 7183", item: "Subscription, 1 month", coverageEnd: "2026-11-27", paymentMethod: "FastMet wallet", amount: 300 },
  { id: "payment-03", paidAt: "2026-10-27T09:00:00+08:00", vehiclePlate: "NBC 4522", item: "Subscription, 1 month", coverageEnd: "2026-11-27", paymentMethod: "FastMet wallet", amount: 300 },
  { id: "payment-04", paidAt: "2026-10-20T09:00:00+08:00", vehiclePlate: "NFQ 6640", item: "Subscription, 1 month", coverageEnd: "2026-11-20", paymentMethod: "GCash", amount: 200 },
  { id: "payment-05", paidAt: "2026-10-13T09:00:00+08:00", vehiclePlate: "CAR 9056", item: "Subscription, 1 month", coverageEnd: "2026-11-13", paymentMethod: "GCash", amount: 300 },
  { id: "payment-06", paidAt: "2026-10-06T09:00:00+08:00", vehiclePlate: "DAB 2149", item: "Subscription, 1 month", coverageEnd: "2026-11-06", paymentMethod: "GCash", amount: 300 },
  { id: "payment-07", paidAt: "2026-06-10T10:00:00+08:00", vehiclePlate: "NDA 7183", item: "Vehicle deposit", coverageEnd: null, paymentMethod: "GCash", amount: 1500 },
  { id: "payment-08", paidAt: "2026-06-02T10:00:00+08:00", vehiclePlate: "NEX 3317", item: "Vehicle deposit", coverageEnd: null, paymentMethod: "GCash", amount: 1500 },
  { id: "payment-09", paidAt: "2026-05-31T10:00:00+08:00", vehiclePlate: "NBC 4522", item: "Vehicle deposit", coverageEnd: null, paymentMethod: "GCash", amount: 1500 },
  { id: "payment-10", paidAt: "2026-04-17T10:00:00+08:00", vehiclePlate: "DAB 2149", item: "Vehicle deposit", coverageEnd: null, paymentMethod: "GCash", amount: 1500 },
  { id: "payment-11", paidAt: "2026-03-07T10:00:00+08:00", vehiclePlate: "CAR 9056", item: "Vehicle deposit", coverageEnd: null, paymentMethod: "GCash", amount: 1500 },
  { id: "payment-12", paidAt: "2026-02-20T10:00:00+08:00", vehiclePlate: "NFQ 6640", item: "Vehicle deposit", coverageEnd: null, paymentMethod: "GCash", amount: 1000 },
];
