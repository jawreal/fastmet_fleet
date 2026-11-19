import { cn } from "@/lib/utils";

export function FleetStripes({ className }: Readonly<{ className?: string }>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "fleet-stripes pointer-events-none absolute inset-x-0 bottom-0 -z-10 overflow-hidden",
        className,
      )}
    />
  );
}
