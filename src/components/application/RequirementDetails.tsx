"use client";

import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  requirementLabels,
  type Requirement,
} from "@/lib/application/requirements";
import { type StagedReplacement } from "./ReplacementFigure";
import { RequirementDocuments } from "./RequirementDocuments";

export const requirementStatuses = {
  approved: {
    label: "Approved",
    text: "text-muted-foreground",
    badge: "border-input bg-background dark:bg-[#0f0f0f]",
  },
  pending: {
    label: "Awaiting review",
    text: "text-muted-foreground",
    badge: "border-input bg-background dark:bg-[#0f0f0f]",
  },
  needs_update: {
    label: "Needs correction",
    text: "text-destructive",
    badge: "border-destructive/35 bg-destructive/10",
  },
  staged: {
    label: "Ready to submit",
    text: "text-primary-foreground dark:text-primary",
    badge: "border-primary/35 bg-primary/10",
  },
};

export type RequirementDisplayStatus = keyof typeof requirementStatuses;

export function RequirementDetails({
  document,
  status,
  replacement,
  editable,
  error,
  onReplacement,
  children,
}: Readonly<{
  document: Requirement;
  status: RequirementDisplayStatus;
  replacement?: StagedReplacement;
  editable: boolean;
  error?: string;
  onReplacement: (file?: File) => void;
  children?: ReactNode;
}>) {
  const { field, reason } = document;
  const statusStyle = requirementStatuses[status];

  return (
    <article
      id="requirement-details"
      aria-labelledby="requirement-details-title"
      className="min-w-0 flex-[999_1_460px] rounded-2xl border bg-card"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4">
        <h2
          id="requirement-details-title"
          className="text-base font-semibold tracking-tight"
        >
          {requirementLabels[field]}
        </h2>
        <span
          className={`inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-semibold whitespace-nowrap ${statusStyle.text} ${statusStyle.badge}`}
        >
          {statusStyle.label}
        </span>
      </header>

      <div className="flex flex-col gap-5 p-4">
        {document.status === "needs_update" && reason && (
          <Alert
            variant="destructive"
            className="gap-0.5 rounded-[8px] border-destructive/30 bg-destructive/7 px-3 py-2.5"
          >
            <AlertTitle className="text-xs font-medium text-destructive">
              Reviewer feedback
            </AlertTitle>
            <AlertDescription className="wrap-anywhere whitespace-pre-wrap text-xs text-destructive! dark:text-[#fca5a5]!">
              {reason}
            </AlertDescription>
          </Alert>
        )}

        <RequirementDocuments
          document={document}
          replacement={replacement}
          editable={editable}
          error={error}
          onReplacement={onReplacement}
        />
        {children}
      </div>
    </article>
  );
}
