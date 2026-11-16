"use client";

import {
  LayoutDashboardIcon,
  ClipboardListIcon,
  MapPinIcon,
  MessageSquareIcon,
  TruckIcon,
  UsersIcon,
  WrenchIcon,
  FuelIcon,
  WalletIcon,
  CreditCardIcon,
  ChartColumnIcon,
  SlidersHorizontalIcon,
  LucideIcon,
} from "lucide-react";

interface INavigationLinks {
  label: string;
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
}

const navigationLinks: Readonly<INavigationLinks[]> = [
  {
    label: "Operations",
    items: [
      { title: "Overview", url: "/operations/overview", icon: LayoutDashboardIcon },
      { title: "Bookings", url: "/operations/bookings", icon: ClipboardListIcon },
      { title: "Live tracking", url: "/operations/live-tracking", icon: MapPinIcon },
      { title: "Messages", url: "/operations/messages", icon: MessageSquareIcon },
    ],
  },
  {
    label: "Fleet",
    items: [
      { title: "Trucks", url: "/fleet/trucks", icon: TruckIcon },
      {
        title: "Drivers & helpers",
        url: "/fleet/drivers-helpers",
        icon: UsersIcon,
      },
      { title: "Maintenance", url: "/fleet/maintenance", icon: WrenchIcon },
      { title: "Fuel", url: "/fleet/fuel", icon: FuelIcon },
    ],
  },
  {
    label: "Business",
    items: [
      {
        title: "Earnings & payouts",
        url: "/business/earnings-payouts",
        icon: WalletIcon,
      },
      {
        title: "Subscriptions",
        url: "/business/subscriptions",
        icon: CreditCardIcon,
      },
      { title: "Reports", url: "/business/reports", icon: ChartColumnIcon },
      { title: "Settings", url: "/business/settings", icon: SlidersHorizontalIcon },
    ],
  },
];

export { type INavigationLinks, navigationLinks };
