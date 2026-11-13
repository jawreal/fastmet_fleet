"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TruckProfile } from "@/lib/truckDetailsData";
import { SheetSection } from "./DetailsLayout";

type TruckDocumentsSectionProps = {
  approved: boolean;
  documents: TruckProfile["documents"];
};

export function TruckDocumentsSection({
  approved,
  documents,
}: Readonly<TruckDocumentsSectionProps>) {
  return (
    <>
      {/* ------ Vehicle files and approval --------- */}
      <SheetSection title="Vehicle files and approval">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={
                  approved
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "text-muted-foreground"
                }
              >
                {approved ? "Approved" : "Not submitted"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {approved
                  ? "5 of 5 required files"
                  : "No sample files available"}
              </span>
            </div>
            {approved && (
              <div className="flex items-start gap-1.5 text-xs/relaxed text-muted-foreground">
                <Check
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0"
                />
                <p>
                  Verified by FastMet{" "}
                  <span aria-hidden="true" className="mx-1.5">
                    ·
                  </span>
                  <time dateTime="2026-06-09" className="whitespace-nowrap">
                    Jun 9, 2026
                  </time>
                </p>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="lg"
            render={<Link href="/business/subscriptions" />}
            nativeButton={false}
            className="shrink-0 self-start px-3"
          >
            View or update files
          </Button>
        </div>
      </SheetSection>
      {/* ------ Vehicle documents --------- */}
      <SheetSection title="Documents">
        {documents.length ? (
          <ul className="space-y-3">
            {documents.map((document) => (
              <li
                key={document.name}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span className="text-xs">{document.name}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1.5 font-normal",
                    document.warning
                      ? "border-primary/20 bg-primary/10 text-yellow-700 dark:text-primary"
                      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-current"
                  />
                  {document.status}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">
            No document records in this sample.
          </p>
        )}
      </SheetSection>
    </>
  );
}
