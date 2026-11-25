import type { ComponentProps } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AuthAlert({
  children,
  ref,
}: Readonly<Pick<ComponentProps<"div">, "children" | "ref">>) {
  return (
    <Alert
      ref={ref}
      tabIndex={ref ? -1 : undefined}
      variant="destructive"
      className="rounded-md border-destructive/30 bg-destructive/5 px-3 py-2 text-red-700 *:data-[slot=alert-description]:text-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current dark:text-destructive"
    >
      <AlertCircle aria-hidden="true" />
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
