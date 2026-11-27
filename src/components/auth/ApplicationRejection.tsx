import { Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fleetSupportEmail } from "@/lib/application/requirements";
import { useCopy } from "./FormParts";

const previewLength = 180;
const previewLines = 4;

function focusDecision(heading: HTMLHeadingElement | null) {
  heading?.focus();
}

function getReasonPreview(reason: string) {
  const preview = Array.from(reason.split("\n", previewLines).join("\n"))
    .slice(0, previewLength)
    .join("");
  if (preview.length === reason.length) return null;

  let end = preview.length;
  if (reason.charAt(end).trim()) {
    while (end > 0 && preview.charAt(end - 1).trim()) end--;
  }
  return (end > 0 ? preview.slice(0, end) : preview).trimEnd();
}

export function ApplicationRejection({
  reason,
  onBack,
}: Readonly<{ reason: string; onBack: () => void }>) {
  const { copy, feedback } = useCopy();
  const [expanded, setExpanded] = useState(false);
  const fullReason = (reason.trim() || "A reason wasn’t provided.").replaceAll(
    "\r\n",
    "\n",
  );
  const preview = getReasonPreview(fullReason);

  return (
    <article className="w-full">
      <header>
        <h1
          id="auth-heading"
          ref={focusDecision}
          tabIndex={-1}
          aria-describedby="rejection-reason"
          className="rounded-sm text-3xl leading-tight font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Application rejected
        </h1>
      </header>

      <div className="mt-5 rounded-lg border  border-destructive/20 bg-destructive/5 px-4 py-3.5 dark:bg-destructive/8">
        <h2 className="text-xs font-semibold text-destructive">
          Reason for rejection
        </h2>
        <p
          id="rejection-reason"
          className="mt-1.5 text-start text-sm leading-relaxed whitespace-pre-wrap wrap-anywhere"
        >
          {preview !== null && !expanded ? `${preview}…` : fullReason}
        </p>
        {preview !== null && (
          <button
            type="button"
            aria-controls="rejection-reason"
            aria-expanded={expanded}
            className="mt-1 inline-flex min-h-8 items-center rounded-sm text-xs font-medium underline decoration-destructive/60 underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "See less" : "See more"}
          </button>
        )}
      </div>

      <Button
        type="button"
        className="mt-5 h-auto min-h-11 w-full rounded-lg py-2 text-sm motion-reduce:transition-none"
        onClick={onBack}
      >
        Back to sign in
      </Button>

      <footer className="mt-5 border-t pt-3 text-xs leading-5 text-muted-foreground">
        <p>Questions about this decision? Contact FastMet support.</p>
        <div className="flex items-center justify-center gap-1">
          <a
            href={`mailto:${fleetSupportEmail}`}
            className="inline-flex min-h-8 min-w-0 items-center rounded-sm font-medium wrap-anywhere underline underline-offset-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {fleetSupportEmail}
          </a>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Copy support email"
            onClick={() => void copy(fleetSupportEmail)}
            className="text-muted-foreground motion-reduce:transition-none"
          >
            <Copy aria-hidden="true" />
          </Button>
        </div>
        <output className="block empty:sr-only">{feedback}</output>
      </footer>
    </article>
  );
}
