"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
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
} from "lucide-react";

interface INavigation {
  label: string;
  items: {
    title: string;
    url: string;
    icon: React.ReactNode;
  }[];
}

const navigation: Readonly<INavigation[]> = [
  {
    label: "Operations",
    items: [
      { title: "Overview", url: "/overview", icon: <LayoutDashboardIcon /> },
      { title: "Bookings", url: "/bookings", icon: <ClipboardListIcon /> },
      { title: "Live tracking", url: "/live-tracking", icon: <MapPinIcon /> },
      { title: "Messages", url: "/messages", icon: <MessageSquareIcon /> },
    ],
  },
  {
    label: "Fleet",
    items: [
      { title: "Trucks", url: "/trucks", icon: <TruckIcon /> },
      {
        title: "Drivers & helpers",
        url: "/drivers-helpers",
        icon: <UsersIcon />,
      },
      { title: "Maintenance", url: "/maintenance", icon: <WrenchIcon /> },
      { title: "Fuel", url: "/fuel", icon: <FuelIcon /> },
    ],
  },
  {
    label: "Business",
    items: [
      {
        title: "Earnings & payouts",
        url: "/earnings-payouts",
        icon: <WalletIcon />,
      },
      {
        title: "Subscriptions",
        url: "/subscriptions",
        icon: <CreditCardIcon />,
      },
      { title: "Reports", url: "/reports", icon: <ChartColumnIcon /> },
      { title: "Settings", url: "/settings", icon: <SlidersHorizontalIcon /> },
    ],
  },
];

// border-t border-sidebar-border from sidebar footer

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5! mt-2 md:mt-1"
              render={<Link href="/overview" />}
            >
              <Image
                src="/icon.png"
                alt="FastMet icon"
                width={30}
                height={30}
              />
              <div>
                <span className="text-base font-semibold">FastMet</span>
                <p className="text-muted-foreground uppercase text-xs font-mono">
                  fleet management
                </p>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navigation.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter className="mx-2 px-0 pt-1">
        <NavUser
          company={{
            name: "Bayani Trucking Services",
            location: "Km 14 MacArthur Hwy, Malinta, Valenzuela City",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
