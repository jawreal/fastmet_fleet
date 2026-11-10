import type { CSSProperties, PropsWithChildren } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SiteHeader } from "@/components/SiteHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface AppShellProps extends PropsWithChildren {
  title?: string;
}

export function AppShell({ title, children }: Readonly<AppShellProps>) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={title} />
        <main className="flex flex-1 flex-col p-4 lg:p-6">
          <div className="w-full self-center max-w-5xl">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
