import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPesos } from "@/lib/reportData";
import { subscriptionPlans } from "../../lib/SubscriptionData";

export function SubscriptionPlans() {
  return (
    <section
      aria-label="Subscription plans"
      className="grid gap-3 @min-[30rem]:grid-cols-2 @min-[60rem]:grid-cols-4"
    >
      {subscriptionPlans.map((plan) => (
        <Card key={plan.name}>
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex flex-wrap items-baseline gap-2 tabular-nums">
              <span className="text-xs text-muted-foreground line-through">
                <span className="sr-only">Regular price </span>
                {formatPesos(plan.regularPrice)}
              </span>
              <span className="text-2xl font-semibold tracking-tight">
                {formatPesos(plan.monthlyPrice)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              per month, per vehicle
            </p>
          </CardContent>
          <CardFooter className="mt-auto flex-col items-start gap-1 border-t">
            <p className="text-xs font-medium">{plan.vehicles}</p>
            <p className="text-xs/relaxed text-muted-foreground">
              {formatPesos(plan.deposit)} refundable deposit per vehicle
            </p>
          </CardFooter>
        </Card>
      ))}
      <Card className="bg-primary/5 ring-primary/25">
        <CardHeader>
          <CardTitle>Launch offer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tracking-tight text-primary">
            80% off
          </p>
        </CardContent>
        <CardFooter className="mt-auto border-t border-primary/20">
          <p className="text-xs/relaxed text-muted-foreground">
            No commission on any trip. Keep the full fare and pay only for your
            monthly vehicle slots.
          </p>
        </CardFooter>
      </Card>
    </section>
  );
}
