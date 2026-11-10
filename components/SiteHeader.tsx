"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { navigationLinks } from "@/lib/navLinks";

interface ISiteHeader {
  title?: string;
}

export function SiteHeader({ title = "Overview" }: Readonly<ISiteHeader>) {
  const pathname = usePathname();
  const group = navigationLinks.find(({ items }) =>
    items.some(({ url }) => pathname === url || pathname.startsWith(`${url}/`)),
  );
  const item = group?.items.find(
    ({ url }) => pathname === url || pathname.startsWith(`${url}/`),
  );

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <Breadcrumb>
          <BreadcrumbList className="text-sm">
            {group && (
              <>
                <BreadcrumbItem>{group.label}</BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">
                {item?.title ?? title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
