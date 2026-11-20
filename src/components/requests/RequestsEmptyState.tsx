import { InboxIcon } from "lucide-react";

// A single reusable card handles panel-level emptiness; empty vehicle sections need no card.
export function RequestsEmptyState({
  offers = false,
}: Readonly<{ offers?: boolean }>) {
  const title = offers ? "No offers sent" : "No actionable requests";
  const description = offers
    ? "Requests you make an offer on will appear here."
    : "Requests for your available units will appear here.";
  return (
    <section
      aria-label={title}
      className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-background/50 px-4 py-6 text-center"
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <InboxIcon aria-hidden="true" className="size-5" />
      </span>
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-56 text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </section>
  );
}
