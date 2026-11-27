import type { Metadata } from "next";
import { FileWarning } from "lucide-react";
import { Suspense } from "react";
import { RequirementsForm } from "@/components/application/RequirementsForm";
import {
  RetryRequirementsButton,
  RequirementsHeader,
} from "@/components/application/RequirementsControls";
import { loadFleetRequirements } from "@/lib/application/backend";
import { requireOnboardingAccess } from "@/lib/auth/server/dal";
import "@/components/application/requirements-workspace.css";

export const metadata: Metadata = {
  title: "Application requirements | FastMet Fleet",
};

async function Workspace() {
  const { account } = await requireOnboardingAccess();
  const application = await loadFleetRequirements();
  if (application) {
    // A new review round or status starts a fresh replacement form.
    return (
      <RequirementsForm
        key={`${application.round}-${application.status}`}
        application={application}
        companyName={account.companyName}
      />
    );
  }

  return (
    <div className="requirements-workspace">
      <RequirementsHeader />
      <main className="mx-auto max-w-[1040px] px-4 pt-10 pb-16">
        <p className="wrap-anywhere text-xs text-muted-foreground">
          {account.companyName}
        </p>
        <h1 className="mt-1 text-xl leading-tight font-semibold tracking-tight">
          Application requirements
        </h1>
        <section
          aria-labelledby="requirements-load-error"
          className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-4 rounded-[16px] border bg-card p-4 text-card-foreground sm:p-5"
        >
          <div className="flex min-w-0 flex-[1_1_18rem] items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-destructive/10 text-destructive">
              <FileWarning aria-hidden="true" className="size-5" />
            </span>
            <div role="alert" className="min-w-0 space-y-1">
              <h2
                id="requirements-load-error"
                className="text-sm font-semibold"
              >
                We couldn’t load your requirements
              </h2>
              <p className="text-[13px] text-muted-foreground">
                Try again to reload your application documents.
              </p>
            </div>
          </div>
          <RetryRequirementsButton />
        </section>
      </main>
    </div>
  );
}

export default function RequirementsPage() {
  return (
    <Suspense
      fallback={
        <output className="block p-6 text-sm text-muted-foreground">
          Loading application…
        </output>
      }
    >
      <Workspace />
    </Suspense>
  );
}
