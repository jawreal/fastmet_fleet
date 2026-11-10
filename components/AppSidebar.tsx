"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { NavMain } from "@/components/NavMain";
import { NavUser } from "@/components/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { navigationLinks } from "@/lib/navLinks";

// border-t border-sidebar-border from sidebar footer

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5! mt-2 md:mt-1"
              render={<Link href="/operations/overview" />}
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
        {navigationLinks.map((group) => (
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
