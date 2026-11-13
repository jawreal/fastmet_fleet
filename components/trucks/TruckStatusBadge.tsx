import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TruckStatus } from "@/lib/truckData";

type TruckStatusBadgeProps = { status: TruckStatus };
export function TruckStatusBadge({ status }: Readonly<TruckStatusBadgeProps>) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 whitespace-nowrap font-normal",
        status === "Available" &&
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        status === "On trip" &&
          "border-primary/30 bg-primary/10 text-yellow-700 dark:text-primary",
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {status}
    </Badge>
  );
}
