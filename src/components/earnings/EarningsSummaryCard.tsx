import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export interface EarningsSummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  footer: ReactNode;
}

export function EarningsSummaryCard({
  title,
  value,
  description,
  icon: Icon,
  footer,
}: Readonly<EarningsSummaryCardProps>) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-muted-foreground">{title}</CardTitle>
          <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="mt-auto">{footer}</CardFooter>
    </Card>
  );
}
