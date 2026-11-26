"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  maxRequirementBytes,
  requirementLabels,
  requirementsApi,
  type RequirementField,
  type Requirements,
} from "@/lib/application/requirements";
import { RefreshRequirementsButton } from "./RequirementsControls";

const statuses = {
  approved: "Approved",
  pending: "Awaiting review",
  needs_update: "Needs correction",
};
const uploadErrorSchema = z.object({
  message: z.string(),
  errors: z.record(z.string(), z.string()).optional(),
});

function ReplacementInput({
  field,
  error,
}: Readonly<{ field: RequirementField; error?: string }>) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ type: string; url: string }>();
  const [validation, setValidation] = useState("");
  const id = `replacement-${field}`;
  const message = validation || error;
  const imagesOnly = field === "logo";
  const errorIdSuffix = message ? ` ${id}-error` : "";

  useEffect(() => {
    // Release the local preview when the file changes or the input unmounts.
    if (preview) return () => URL.revokeObjectURL(preview.url);
  }, [preview]);

  return (
    <div className="space-y-2 sm:max-w-md">
      <label htmlFor={id} className="block text-sm font-medium">
        Replacement for {requirementLabels[field]}
      </label>
      <Input
        ref={input}
        id={id}
        name={field}
        type="file"
        required
        accept={imagesOnly ? ".jpg,.jpeg,.png" : ".jpg,.jpeg,.png,.pdf"}
        aria-invalid={!!message}
        aria-describedby={`${id}-help${errorIdSuffix}`}
        onChange={(event) => {
          const file = event.target.files?.[0];
          setValidation("");
          setPreview(undefined);
          if (!file) return;
          const extension = imagesOnly
            ? /\.(?:jpe?g|png)$/i
            : /\.(?:jpe?g|png|pdf)$/i;
          if (
            !extension.test(file.name) ||
            file.size === 0 ||
            file.size > maxRequirementBytes
          ) {
            event.target.value = "";
            setValidation(
              "Choose an allowed file type between 1 byte and 10 MB.",
            );
            return;
          }
          setPreview({ type: file.type, url: URL.createObjectURL(file) });
        }}
      />
      <p id={`${id}-help`} className="text-xs text-muted-foreground">
        {imagesOnly ? "JPG or PNG" : "JPG, PNG or PDF"}, up to 10 MB.
      </p>
      {message && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {message}
        </p>
      )}
      {preview && (
        <div className="flex flex-wrap items-center gap-2">
          {["image/jpeg", "image/png"].includes(preview.type) && (
            <Image
              unoptimized
              src={preview.url}
              alt={`Selected replacement for ${requirementLabels[field]}`}
              width={96}
              height={72}
              className="max-h-20 w-auto rounded-sm border object-contain"
            />
          )}
          {preview.type === "application/pdf" && (
            <a
              className="text-sm underline"
              href={preview.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Preview selected PDF
            </a>
          )}
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => {
              if (input.current) input.current.value = "";
              setPreview(undefined);
              input.current?.focus();
            }}
          >
            Remove replacement
          </Button>
        </div>
      )}
    </div>
  );
}

export function RequirementsForm({
  application,
}: Readonly<{ application: Requirements }>) {
  const router = useRouter();
  const [error, setError] = useState<z.infer<typeof uploadErrorSchema>>();
  const form = useRef<HTMLFormElement>(null);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inFlight = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const waiting = submitted || application.status === "under_review";
  const flagged = application.documents.filter(
    (document) => document.status === "needs_update" && document.reason,
  );
  const approved = application.documents.filter(
    (doc) => doc.status === "approved",
  ).length;
  // Send the revisions with the review round so the backend can reject stale replacements.
  const revisions = Object.fromEntries(
    flagged.map(({ field, revision }) => [field, revision]),
  );

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || waiting || !form.current || !flagged.length) return;
    // Read the files before the sending state disables their inputs.
    const body = new FormData(form.current);
    dialog.current?.close();
    inFlight.current = true;
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
              "Unable to submit your replacements. Check the files and try again.",
          },
        );
        return;
      }
      // Show the waiting state immediately while the server refreshes the review details.
      setSubmitted(true);
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

  return (
    <>
      <output className="sr-only">
        {submitted ? "Updated requirements received." : ""}
      </output>
      <section
        aria-labelledby="requirement-status"
        className="space-y-2 border-y py-4"
      >
        <h2 id="requirement-status" className="font-semibold">
          {waiting ? "Awaiting review" : "Action required"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {waiting
            ? "Your updated requirements were received. We’ll email you once a decision has been made."
            : "Replace each flagged document so we can finish verifying your application and grant access to Fleet operations."}
        </p>
        <label htmlFor="requirements-progress" className="block text-sm">
          {approved} of {application.documents.length} approved
          {!waiting && ` · ${flagged.length} require correction`}
        </label>
        <progress
          id="requirements-progress"
          max={application.documents.length}
          value={approved}
          className="w-full accent-primary"
        />
        <p className="text-sm text-muted-foreground">
          Review round {application.round + Number(submitted)}
        </p>
      </section>
      <form
        ref={form}
        action={requirementsApi}
        method="post"
        encType="multipart/form-data"
        aria-labelledby="requirements-heading"
        onChange={(event) => {
          if (
            !(event.target instanceof HTMLInputElement) ||
            !error?.errors?.[event.target.name]
          )
            return;
          setError({
            ...error,
            errors: { ...error.errors, [event.target.name]: "" },
          });
        }}
        onSubmit={(event) => {
          event.preventDefault();
          if (!flagged.length || waiting || inFlight.current) return;
          dialog.current?.showModal();
          cancel.current?.focus();
        }}
      >
        <input type="hidden" name="round" value={application.round} />
        <input
          type="hidden"
          name="revisions"
          value={JSON.stringify(revisions)}
        />
        <h2 id="requirements-heading" className="font-medium">
          Required documents
        </h2>
        <fieldset disabled={sending}>
          <legend className="sr-only">
            Application documents and replacements
          </legend>
          <ul className="divide-y border-b">
            {application.documents.map(
              ({ field, status, originalName, revision, reason }) => {
                const needsReplacement = status === "needs_update" && !!reason;
                const displayStatus =
                  submitted && needsReplacement ? "pending" : status;
                return (
                  <li key={field} className="space-y-3 py-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="font-medium">
                        {requirementLabels[field]}
                      </h3>
                      <span className="text-sm">{statuses[displayStatus]}</span>
                    </div>
                    {originalName && !(submitted && needsReplacement) && (
                      <p className="wrap-break-word text-sm text-muted-foreground">
                        {originalName} · Revision {revision}
                      </p>
                    )}
                    {!waiting && needsReplacement && (
                      <>
                        <p className="wrap-break-word whitespace-pre-wrap text-sm">
                          {reason}
                        </p>
                        <ReplacementInput
                          field={field}
                          error={error?.errors?.[field]}
                        />
                      </>
                    )}
                  </li>
                );
              },
            )}
          </ul>
        </fieldset>
        <div className="mt-4 flex flex-wrap gap-3">
          {!waiting && flagged.length > 0 && (
            <Button type="submit" disabled={sending}>
              {sending ? "Submitting…" : "Submit replacements"}
            </Button>
          )}
          <RefreshRequirementsButton />
        </div>
        {!waiting && flagged.length === 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            Replacement instructions are unavailable. Refresh to check the
            current status.
          </p>
        )}
        {error && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {error.message}
          </p>
        )}
      </form>
      <dialog
        ref={dialog}
        aria-labelledby="replacement-confirm-title"
        aria-describedby="replacement-confirm-text"
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md overscroll-contain rounded-lg border bg-card p-5 text-card-foreground backdrop:overflow-hidden backdrop:overscroll-contain backdrop:bg-black/50"
      >
        <form className="space-y-4" onSubmit={(event) => void submit(event)}>
          <h1 id="replacement-confirm-title" className="font-semibold">
            Submit replacement documents?
          </h1>
          <p
            id="replacement-confirm-text"
            className="text-sm text-muted-foreground"
          >
            We’ll review the replacements together. You can upload files again
            if we request further corrections.
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              ref={cancel}
              type="button"
              variant="outline"
              onClick={() => dialog.current?.close()}
            >
              Cancel
            </Button>
            <Button type="submit">Confirm submission</Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
