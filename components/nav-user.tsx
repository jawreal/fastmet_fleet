"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  ChevronsUpDownIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface ICompany {
  company: { name: string; location: string };
}

const subscribe = () => () => {};

export function NavUser({ company }: Readonly<ICompany>) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [confirmLogout, setConfirmLogout] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  ref={triggerRef}
                  size="lg"
                  className={cn(
                    // 1. Layout: same sizing as before
                    "h-auto min-h-20 rounded-md px-4 py-3 transition-colors",

                    // 2. Gradient: a soft fade that ends in transparent, so it blends into any sidebar bg
                    "bg-linear-to-br from-primary/15 via-primary/5 to-transparent",

                    // 3. Border: a thin, low-opacity tint of the primary color
                    "border border-primary/20",

                    // 4. Depth: a 1px inner highlight on the top edge plus a very soft outer shadow
                    "shadow-[inset_0_1px_0_rgb(255_255_255/0.5)] shadow-primary/5",

                    // 5. Dark mode: stronger gradient (dark surfaces swallow low opacity) and a subtler highlight
                    "dark:from-primary/25 dark:via-primary/10 dark:border-primary/30",
                    "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]",

                    // 6. Interaction: brighten the border and gradient slightly instead of swapping the bg
                    "hover:border-primary/40 hover:from-primary/20",
                    "aria-expanded:border-primary/40 aria-expanded:from-primary/20",
                  )}
                />
              }
            >
              <div className="grid min-w-0 flex-1 gap-1 text-left text-sm leading-tight">
                <span
                  className="truncate text-xs font-semibold"
                  title={company.name}
                >
                  {company.name}
                </span>
                <span
                  className="truncate text-xs text-muted-foreground"
                  title={company.location}
                >
                  {company.location}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4 shrink-0 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-60"
              side={isMobile ? "top" : "right"}
              align="end"
              sideOffset={8}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel>{company.name}</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={mounted ? theme : undefined}
                  onValueChange={setTheme}
                >
                  <DropdownMenuRadioItem value="light">
                    <SunIcon />
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    <MoonIcon />
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    <MonitorIcon />
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirmLogout(true)}
              >
                <LogOutIcon />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <AlertDialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <AlertDialogContent finalFocus={triggerRef}>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of {company.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave your company workspace?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                // Replace with the authentication provider's sign-out when connected.
                setConfirmLogout(false);
                router.replace("/");
              }}
            >
              <LogOutIcon />
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
