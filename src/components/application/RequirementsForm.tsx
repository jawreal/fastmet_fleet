"use client";

import { CircleAlert, CircleArrowUp, CircleCheck, Clock3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  requirementLabels,
  requirementsApi,
  type Requirement,
  type RequirementField,
  type Requirements,
} from "@/lib/application/requirements";
import {
  RequirementDetails,
  requirementStatuses,
  type RequirementDisplayStatus,
  type StagedReplacement,
} from "./RequirementDetails";
import { RequirementsHeader } from "./RequirementsControls";

const statusIcons = {
  approved: CircleCheck,
  pending: Clock3,
  needs_update: CircleAlert,
  staged: CircleArrowUp,
};

const uploadErrorSchema = z.object({
  message: z.string(),
  errors: z.record(z.string(), z.string()).optional(),
});

type Replacements = Partial<Record<RequirementField, StagedReplacement>>;

export function RequirementsForm({
  application,
  companyName,
}: Readonly<{ application: Requirements; companyName: string }>) {
  const router = useRouter();
  const { documents, round } = application;
  const waitingForReview = application.status === "under_review";
  const flagged = documents.filter(({ status }) => status === "needs_update");
  const [selectedField, setSelectedField] = useState(
    () =>
      flagged[0]?.field ??
      documents.find(({ status }) => status === "pending")?.field ??
      documents[0]?.field,
  );
  const [replacements, setReplacements] = useState<Replacements>({});
  const [error, setError] = useState<z.infer<typeof uploadErrorSchema>>();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inFlight = useRef(false);
  const cancel = useRef<HTMLButtonElement>(null);
  const previewUrls = useRef(new Map<RequirementField, string>());

  useEffect(() => {
    const urls = previewUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const selected = documents.find(({ field }) => field === selectedField);
  const waiting = waitingForReview || submitted;
  const approved = documents.filter(
    ({ status }) => status === "approved",
  ).length;
  const canReplace =
    !waiting &&
    flagged.length > 0 &&
    flagged.every(({ reason }) => !!reason?.trim());
  const ready = flagged.filter(
    ({ field }) => replacements[field] && !error?.errors?.[field],
  ).length;
  const outstanding = flagged.length - ready;
  const allReady = outstanding === 0;
  const canSubmit = canReplace && allReady && !sending;
  const readyCount = `${ready} of ${flagged.length}`;

  function displayStatus(document: Requirement): RequirementDisplayStatus {
    if (submitted && document.status === "needs_update") return "pending";
    if (
      !waiting &&
      replacements[document.field] &&
      !error?.errors?.[document.field]
    )
      return "staged";
    return document.status;
  }

  function stageReplacement(field: RequirementField, file?: File) {
    const urls = previewUrls.current;
    const previousUrl = urls.get(field);
    if (previousUrl) URL.revokeObjectURL(previousUrl);
    urls.delete(field);

    let replacement: StagedReplacement | undefined;
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      urls.set(field, previewUrl);
      replacement = { file, previewUrl };
    }
    setReplacements((previous) => ({ ...previous, [field]: replacement }));
    if (error?.errors?.[field]) {
      const errors = { ...error.errors };
      delete errors[field];
      setError(Object.keys(errors).length ? { ...error, errors } : undefined);
    }
  }

  async function submit() {
    if (!canSubmit || inFlight.current) return;

    const revisions: Partial<Record<RequirementField, number>> = {};
    const body = new FormData();
    for (const { field, revision } of flagged) {
      const file = replacements[field]?.file;
      if (!file) return;
      body.set(field, file);
      revisions[field] = revision;
    }
    body.set("round", String(round));
    body.set("revisions", JSON.stringify(revisions));

    inFlight.current = true;
    setConfirmOpen(false);
    setSending(true);
    setError(undefined);
    try {
      const response = await fetch(requirementsApi, { method: "POST", body });
      if (!response.ok) {
        const payload = uploadErrorSchema.safeParse(
          await response.json().catch(() => null),
        );
        setError(
          payload.data ?? {
            message:
              "Unable to submit your corrections. Check the files and try again.",
          },
        );
        const failed = flagged.find(
          ({ field }) => payload.data?.errors?.[field],
        );
        if (failed) setSelectedField(failed.field);
        return;
      }
      setSubmitted(true);
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.current.clear();
      setReplacements({});
      router.refresh();
    } catch {
      setError({
        message:
          "Unable to confirm your submission. Refresh to check the current status.",
      });
    } finally {
      inFlight.current = false;
      setSending(false);
    }
  }

  const correctionSummary = canReplace ? (
    <section
      aria-labelledby="corrections-title"
      aria-busy={sending}
      className="mt-1 flex flex-col gap-3 border-t pt-4"
    >
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error.message}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          aria-live="polite"
          aria-atomic="true"
          className="min-w-0 flex-1 space-y-1"
        >
          <h2
            id="corrections-title"
            className="flex items-center gap-2 text-[13px] font-semibold"
          >
            {allReady && (
              <CircleCheck
                aria-hidden="true"
                strokeWidth={2}
                className="size-4 shrink-0 text-primary-foreground dark:text-primary"
              />
            )}
            {allReady ? "All corrections ready" : "Required corrections"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {allReady
              ? `${readyCount} replacements ready for submission.`
              : `${readyCount} replacements ready · ${outstanding} remaining`}
          </p>
        </div>
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogTrigger
            render={
              <Button
                type="button"
                size="lg"
                className="h-9 rounded-[8px] px-4 text-[13px] font-semibold disabled:pointer-events-auto disabled:cursor-not-allowed max-[480px]:w-full"
                disabled={!canSubmit}
              />
            }
          >
            {sending ? "Submitting…" : "Submit corrections"}
          </AlertDialogTrigger>
          <AlertDialogContent
            initialFocus={cancel}
            className="requirements-dialog w-[calc(100%-2rem)]"
          >
            <AlertDialogHeader>
              <AlertDialogTitle>
                Submit corrections for review?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Your{" "}
                {ready === 1
                  ? "replacement will"
                  : `${ready} replacements will`}{" "}
                be submitted in one batch. You’ll be able to upload files again
                if we request further corrections.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel ref={cancel}>Cancel</AlertDialogCancel>
              <AlertDialogAction type="button" onClick={() => void submit()}>
                Confirm submission
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {!allReady && (
        <Progress
          aria-labelledby="corrections-title"
          aria-valuetext={`${readyCount} replacements ready`}
          max={flagged.length}
          value={ready}
          className="**:data-[slot=progress-track]:rounded-full **:data-[slot=progress-indicator]:rounded-full"
        />
      )}
    </section>
  ) : null;

  return (
    <div className="requirements-workspace">
      <RequirementsHeader
        hasReplacements={Object.values(replacements).some(Boolean)}
        submitting={sending}
      />
      <main className="mx-auto max-w-[1040px] px-4 pt-10 pb-16">
        <div>
          <p className="wrap-anywhere text-xs text-muted-foreground">
            {companyName}
          </p>
          <h1 className="mt-1 text-xl leading-tight font-semibold tracking-tight">
            Application requirements
          </h1>
          <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">
            {waiting
              ? "Your updated requirements are awaiting review. We’ll email you when a decision is made."
              : "Replace the flagged documents, then submit them together for review."}
          </p>
        </div>
        <output className="sr-only">
          {submitted ? "Corrections submitted for review." : ""}
        </output>
        <div className="mt-6 flex flex-wrap items-start gap-4">
          <nav
            aria-label="Documents"
            className="max-w-[320px] flex-[1_1_280px] rounded-[16px] border bg-card p-2 max-[789px]:max-w-none"
          >
            <div className="flex flex-col gap-2 px-2 pt-2 pb-3">
              <h2
                id="requirements-heading"
                className="text-[13px] font-semibold"
              >
                Documents
              </h2>
              <p
                id="requirements-progress-label"
                className="text-xs text-muted-foreground"
              >
                {approved} of {documents.length} approved
              </p>
              <Progress
                aria-labelledby="requirements-progress-label"
                value={approved}
                max={documents.length || 1}
                className="**:data-[slot=progress-track]:rounded-full **:data-[slot=progress-indicator]:rounded-full"
              />
            </div>
            <ul className="flex list-none flex-col gap-1">
              {documents.map((document) => {
                const { field, originalName } = document;
                const status = displayStatus(document);
                const Icon = statusIcons[status];
                const { label, text } = requirementStatuses[status];
                return (
                  <li key={field}>
                    <button
                      type="button"
                      aria-current={
                        selectedField === field ? "true" : undefined
                      }
                      aria-controls={
                        selected ? "requirement-details" : undefined
                      }
                      onClick={() => setSelectedField(field)}
                      className="flex w-full items-center gap-2.5 rounded-[10px] border border-transparent p-2.5 text-left hover:bg-secondary aria-current:border-input aria-current:bg-accent"
                    >
                      <Icon
                        aria-hidden="true"
                        strokeWidth={2}
                        className={`size-4 shrink-0 ${text}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] leading-[1.35] font-semibold">
                          {field === "repGovernmentId"
                            ? "Government ID"
                            : requirementLabels[field]}
                        </span>
                        <span
                          className={`block truncate text-[11px] leading-[1.4] ${status === "approved" ? "text-muted-foreground dark:text-[#8f8f8f]" : text}`}
                        >
                          {status === "approved" && originalName
                            ? originalName
                            : label}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {selected ? (
            <RequirementDetails
              key={selected.field}
              document={selected}
              status={displayStatus(selected)}
              editable={
                canReplace && !sending && selected.status === "needs_update"
              }
              replacement={replacements[selected.field]}
              error={error?.errors?.[selected.field]}
              onReplacement={(file) => stageReplacement(selected.field, file)}
            >
              {correctionSummary}
              {!waiting && !canReplace && (
                <output className="border-t pt-4 text-xs text-muted-foreground">
                  Replacement instructions are unavailable.
                </output>
              )}
            </RequirementDetails>
          ) : (
            <p className="flex-[999_1_460px] rounded-[16px] border bg-card p-4 text-xs text-muted-foreground">
              No documents are available.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
