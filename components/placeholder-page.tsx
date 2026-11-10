import type { CSSProperties } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <SidebarProvider style={{
      "--sidebar-width": "calc(var(--spacing) * 72)",
      "--header-height": "calc(var(--spacing) * 12)",
    } as CSSProperties}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={title} />
        <main className="flex flex-1 flex-col p-4 lg:p-6">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
