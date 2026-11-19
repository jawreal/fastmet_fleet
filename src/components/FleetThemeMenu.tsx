"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const themeOptions = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
] as const;

export function FleetThemeMenu({
  systemLabel = "System",
}: Readonly<{ systemLabel?: "System" | "Device" }>) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label="Change theme"
        render={
          <Button
            variant="outline"
            size="icon-lg"
            className="transition-colors duration-150"
          />
        }
      >
        <Sun aria-hidden="true" className="hidden size-4 dark:block" />
        <Moon aria-hidden="true" className="size-4 dark:hidden" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-36 motion-reduce:animate-none"
      >
        <DropdownMenuRadioGroup
          aria-label="Theme"
          value={theme ?? "system"}
          onValueChange={setTheme}
        >
          {themeOptions.map(({ value, label, Icon }) => (
            <DropdownMenuRadioItem
              key={value}
              value={value}
              className="min-h-10 text-sm"
            >
              <Icon aria-hidden="true" />
              {value === "system" ? systemLabel : label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
