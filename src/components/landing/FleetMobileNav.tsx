"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface FleetMobileNavProps {
  links: readonly { href: string; label: string }[];
  signIn: ReactNode;
}

export function FleetMobileNav({
  links,
  signIn,
}: Readonly<FleetMobileNavProps>) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const desktop = window.matchMedia("(min-width: 48rem)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    desktop.addEventListener("change", closeOnDesktop);
    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <Collapsible.Root
      ref={menuRef}
      open={open}
      onOpenChange={setOpen}
      data-fleet-menu={open ? "open" : undefined}
      className="md:hidden"
    >
      <Collapsible.Trigger
        ref={triggerRef}
        aria-label={open ? "Close navigation" : "Open navigation"}
        render={
          <Button
            variant="outline"
            size="icon-lg"
            className="size-11 transition-none"
          />
        }
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </Collapsible.Trigger>
      <Collapsible.Panel
        keepMounted
        className="absolute inset-x-0 top-full h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain bg-background"
      >
        <nav
          aria-label="Main navigation"
          className="fleet-container flex min-h-full flex-col gap-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <ul className="divide-y">
            {links.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center rounded-sm px-2 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-auto border-t pt-4 [&>a]:w-full">{signIn}</div>
        </nav>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
