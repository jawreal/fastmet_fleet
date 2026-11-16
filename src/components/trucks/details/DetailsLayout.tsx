import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SheetSectionProps = { title: string; children: ReactNode };
export function SheetSection({ title, children }: Readonly<SheetSectionProps>) {
  return (
    <section className="space-y-3 border-t p-5">
      <h3 className="text-xs font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}
type DetailGridProps = {
  items: { label: string; value: string }[];
  className?: string;
};
export function DetailGrid({ items, className }: Readonly<DetailGridProps>) {
  return (
    <dl className={cn("grid grid-cols-2 gap-x-4 gap-y-4", className)}>
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className="text-xs font-medium wrap-break-word tabular-nums">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
