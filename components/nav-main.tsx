"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils"

export function NavMain({
  label,
  items,
}: Readonly<{
  label: string;
  items: { title: string; url: string; icon?: React.ReactNode }[];
}>) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-widest">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              pathname === item.url || pathname.startsWith(`${item.url}/`);
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  className={cn(
                    // 1. Base: same height as before, rounded, muted text, smooth state changes
                    "h-9 rounded-lg px-2.5 text-sm text-sidebar-foreground/70 transition-colors",

                    // 2. Hover: a faint wash only (black on light, white on dark)
                    "hover:bg-black/[0.04] hover:text-sidebar-foreground",
                    "dark:hover:bg-white/[0.04]",

                    // 3. Active (light mode): faint black wash, 1px ring, white top highlight
                    "data-active:bg-black/[0.05] data-active:font-medium data-active:text-sidebar-foreground",
                    "data-active:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06),inset_0_1px_0_rgb(255_255_255/0.6)]",

                    // 4. Active (dark mode): faint white wash, 1px ring, subtle top highlight
                    "dark:data-active:bg-white/[0.06]",
                    "dark:data-active:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08),inset_0_1px_0_rgb(255_255_255/0.07)]",

                    // 5. Accent only on the icon: item.icon renders an <svg> directly inside the button
                    "data-active:[&>svg]:text-primary",
                  )}
                  render={
                    <Link
                      href={item.url}
                      aria-current={isActive ? "page" : undefined}
                    />
                  }
                  onClick={() => {
                    if (isMobile) setOpenMobile(false);
                  }}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
