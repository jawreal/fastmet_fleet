"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SiteHeader } from "@/components/SiteHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import {
  RequestsProvider,
  useRequestsUI,
} from "@/components/requests/RequestsProvider";
import { RequestsPreview } from "@/components/requests/RequestsPreview";
import { useRequestOverlay } from "@/hooks/use-request-overlay";
import type { RequestsState } from "@/lib/request-ui";

interface IDashboardShell {
  company: { name: string; location: string };
  initialRequestsState: RequestsState;
  initialLeftOpen: boolean;
  children: ReactNode;
}

interface IDashboardGrid {
  company: IDashboardShell["company"];
  initialLeftOpen: boolean;
  children: ReactNode;
}

export function DashboardShell({
  company,
  initialRequestsState,
  initialLeftOpen,
  children,
}: Readonly<IDashboardShell>) {
  // Like route-group middleware, this provider wraps every dashboard page exactly once.
  return (
    <RequestsProvider initialState={initialRequestsState}>
      <DashboardGrid company={company} initialLeftOpen={initialLeftOpen}>
        {children}
      </DashboardGrid>
    </RequestsProvider>
  );
}

function DashboardGrid({
  company,
  initialLeftOpen,
  children,
}: Readonly<IDashboardGrid>) {
  const { state } = useRequestsUI();
  const overlay = useRequestOverlay();
  const [leftOpen, setLeftOpen] = useState(initialLeftOpen);
  return (
    <SidebarProvider
      // A narrow viewport temporarily uses icons without overwriting the saved desktop preference.
      open={overlay ? false : leftOpen}
      onOpenChange={setLeftOpen}
      className="fleet-dashboard"
      data-requests-state={state}
      data-left-open={leftOpen}
      style={
        {
          "--sidebar-width": "18rem",
          "--header-height": "3rem",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" company={company} />
      <div className="fleet-page">
        <SiteHeader />
        {children}
        {/* One themed toaster; simulation never changes the layout state. */}
        <Toaster position="bottom-right" />
      </div>
      <RequestsPreview />
    </SidebarProvider>
  );
}
